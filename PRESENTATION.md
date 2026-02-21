# Tarik.ma — Presentation Plan

**5 Presenters | ~30–35 minutes total**

---

## Overview

**Tarik.ma** is a Moroccan tourism platform that connects tourists with local guides and tour companies. It features AI-powered circuit planning, interactive maps, real-time weather integration, Stripe payments, and a full admin dashboard.

**Tech Stack:**
- **Backend:** Spring Boot 4, Java, PostgreSQL, Flyway (26 migrations), JWT (HMAC-SHA256), Stripe SDK
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, React Query, MapLibre GL, Framer Motion, Orval (API code-gen)
- **AI:** Groq API (Llama 3.3 70B) for circuit generation, route optimization, and place suggestions
- **External APIs:** OpenWeatherMap (weather forecasts), Stripe (payments)

---

## Presenter 1 — Project Manager: AI Features & Application Architecture (~7 min)

### Part A: Application Architecture (3 min)

- **High-level overview:** Monorepo with `backend/` (Spring Boot) and `frontend/` (React + Vite)
- **Architecture pattern:** Layered architecture — Controller → Service → Repository → Entity
- **Database:** PostgreSQL with Flyway migrations (V1–V26), covering users, roles, cities, places, circuits, transport options, sessions, bookings
- **Security model:**
  - Stateless JWT authentication (HMAC-SHA256)
  - Role-based access: ADMIN, CUSTOMER, GUIDE, COMPANY_OWNER, COMPANY_STAFF
  - Public endpoints: auth, health, cities (GET), tours (GET)
  - Protected endpoints: circuits, admin, bookings
- **API documentation:** Swagger/OpenAPI → Orval auto-generates frontend API hooks
- **Diagram suggestion:** Draw a simple flow: `React Frontend → REST API → Spring Boot → PostgreSQL` with side arrows to Groq AI, OpenWeatherMap, and Stripe

### Part B: AI Features (4 min)

- **AI Service:** `AiService.java` — integrates with Groq API (Llama 3.3 70B model, temperature 0.2)
- **3 AI-powered features:**

  1. **AI Circuit Generation** (`POST /api/circuits/ai-generate`)
     - User selects city, number of days (1–7), interests (Culture, Nature, Food, Shopping, Beaches, Nightlife), and optional travel date
     - Backend fetches all places in the city + weather forecast for the date
     - Sends structured prompt to AI with place catalog (id, name, category, lat/lng)
     - AI returns a day-by-day plan with stop kinds (VISIT/EAT/SLEEP), meal types, durations, and start times
     - Backend validates place IDs, creates circuit + stops in DB
     - Frontend: `AiCircuitWizard` — multi-step wizard UI

  2. **AI Route Reordering** (`POST /api/circuits/{id}/ai-reorder`)
     - Takes existing circuit stops and asks AI to optimize the order
     - Considers geographic proximity, logical flow, meal timing, sleep at end of day
     - AI returns `ordered_ids` array; backend validates and applies new positions

  3. **AI Place Suggestions** (`POST /api/circuits/{id}/ai-suggest-places`)
     - AI suggests new places that complement existing circuit stops
     - Creates actual Place records in DB and adds them as stops
     - Avoids duplicating existing places

- **Weather Integration:** `WeatherService.java` — OpenWeatherMap 5-day forecast API feeds weather context into AI prompts (e.g., prefer indoor places if rainy)

- **Demo suggestion:** Show the AI Circuit Wizard generating a 2-day Tangier circuit live

---

## Presenter 2 — Full Stack Developer: User Management & Authentication (~6 min)

### Backend

- **Database tables:** `users`, `roles`, `user_roles`, `guides`, `companies`, `company_members`
- **Flyway migrations:** V1 (create users/roles) → V2 (redesign) → V3–V7 (iterative improvements: verified flag, enabled/disabled, drop username, email-based auth)
- **V4:** Seeds default admin account
- **5 roles:** ADMIN, CUSTOMER, GUIDE, COMPANY_OWNER, COMPANY_STAFF (default: CUSTOMER)
- **Auth flow:**
  - `POST /api/auth/register` — creates user, hashes password (BCrypt), assigns CUSTOMER role, returns JWT
  - `POST /api/auth/login` — validates credentials, returns JWT with claims: email, fullName, roles[]
- **JWT:** HMAC-SHA256, 60-minute expiry, stateless (no server sessions)
- **SecurityConfig:** Spring Security filter chain, role-based endpoint protection, CORS

### Frontend

- **AuthContext:** Decodes JWT client-side, exposes `token`, `roles`, `email`, `fullName`, `isAuthenticated`, `hasRole()`
- **ProtectedRoute / GuestRoute:** Route guards based on auth state and roles
- **Pages:** `LoginPage`, `RegisterPage`
- **Token storage:** localStorage with expiry check

### Admin Dashboard

- **Admin-only routes** (`/admin/*`) protected by `requireRole="ADMIN"`
- **Pages:** Overview, Users, Companies, Company Members, Guides, Roles, Cities, Places
- **Backend:** `AdminController` + `AdminCityController` for CRUD operations

---

## Presenter 3 — Full Stack Developer: Cities, Places & Maps (~6 min)

### Backend

- **Database (V8):** `cities` (id, region, image, description, lat/lng), `city_names` (multilingual: en/fr/ar/amz), `places` (id, city_id, name, description, image, address, category, lat/lng, map_place_id)
- **V9:** Seeds 7 Moroccan cities (Marrakech, Fes, Casablanca, Rabat, Agadir, Essaouira, Ouarzazate)
- **V10–V17:** Seeds places for Tangier, Casablanca, Fes, Marrakech, Rabat, Agadir, Essaouira, Ouarzazate
- **Multilingual support:** Each city has names in 4 languages (English, French, Arabic, Amazigh) with `is_primary` flag
- **Place categories:** HOTEL, RESTAURANT, CAFE, MUSEUM, MOSQUE, PARK, BEACH, MARKET, MONUMENT, HISTORIC, LANDMARK, NATURE, TRANSPORT_HUB
- **Controllers:**
  - `CityController` — public GET for cities and places
  - `AdminCityController` — admin CRUD for cities
  - Place creation restricted to ADMIN/GUIDE/COMPANY_OWNER/COMPANY_STAFF

### Frontend

- **MapLibre GL JS** — open-source map rendering with OpenFreeMap tiles
- **Interactive map** on `CircuitPlanningPage`: color-coded markers by stop kind (SLEEP=purple, EAT=amber, VISIT=green, TRANSPORT=blue), route lines connecting stops
- **RTL plugin** support for Arabic text on maps
- **Home page components:** `CitySelection`, `HeroSection`, `HowItWorks`, `IndependentGuides`, `SmartPersonalization`, `TourismCompanies`

### Transport Options

- **Database (V19):** `transport_options` (from_place_id, to_place_id, mode, pricing_type, price_mad, distance_km, duration_minutes, service times)
- **Modes:** Bus, Grand Taxi, Taxi, Driver
- **Linked to circuit routes** via `transport_option_id` FK
- **API:** `TransportOptionController` — CRUD restricted to ADMIN/GUIDE

---

## Presenter 4 — Full Stack Developer: Circuit Planning & Management (~8 min)

### Backend

- **Database:**
  - V18: `circuits` (id, city_id, name, notes, created_by) + `circuit_stops` (position, place_id, day_number, stop_kind, meal_type, start_time, end_time) + `circuit_routes` (from_stop, to_stop, transport_mode, distance, duration)
  - V20: Schedule fields (start_time, end_time, day_number, stop_kind, meal_type)
  - V22: Duration minutes on stops
  - V24: Price field on circuits (price_mad)
- **CircuitService** — the largest service (~1200 lines):
  - CRUD for circuits, stops, routes
  - Ownership enforcement (created_by = JWT user)
  - Stop reordering with position management
  - City validation (stop's place must belong to circuit's city)
  - Planning warnings system (non-blocking): SLEEP_MISSING, meal gaps, TIME_WINDOW_NOT_SET
- **API endpoints (CircuitController):**
  - CRUD: GET/POST/PUT/DELETE `/api/circuits`
  - Stops: POST/PUT/DELETE `/api/circuits/{id}/stops`
  - Routes: PUT `/api/circuits/{id}/routes` (upsert)
  - Planning warnings: GET `/api/circuits/{id}/planning-warnings`

### Role-Based Access (Important Distinction)

- **CUSTOMER** (tourist planning their own trip):
  - Can create circuits and add existing places as stops
  - Can schedule timing for their trip (day numbers, start/end times, durations)
  - Can use AI Circuit Generation (wizard) and AI Reorder
  - **Cannot** set a price on their circuit
  - **Cannot** use AI Suggest Places (which creates new Place records)
  - **Cannot** add new places to the database
- **GUIDE / COMPANY_OWNER / COMPANY_STAFF** (professionals):
  - All of the above, plus:
  - Can set a price on circuits (turning them into bookable tours)
  - Can use AI Suggest Places
  - Can create new places in the database
  - Can create sessions and publish tours for tourists to book

### Frontend

- **CircuitsPage:** List view with city filter, create form, planning warnings badges, AI wizard launcher
- **CircuitPlanningPage (~1100 lines):** The main planning interface
  - Interactive MapLibre map with color-coded markers and route lines
  - Day-by-day stop list with drag-to-reorder
  - Stop editing: kind (VISIT/EAT/SLEEP), meal type, duration, time windows
  - AI buttons: reorder stops, suggest places (guide/company only)
  - Price editing (guide/company only)
  - Planning warnings panel (dismissible via localStorage)
- **PlanningWarningsPanel / PlanningWarningsBadge:** Reusable warning components with ignore/dismiss functionality

---

## Presenter 5 — Full Stack Developer: Tours, Bookings & Payments (~6 min)

### Backend — Tours

- **TourService:** Public-facing view of circuits that have a price and scheduled sessions
  - `GET /api/tours` — lists published tours (circuits with price_mad set), sorted by next session date
  - `GET /api/tours/{id}` — tour detail with stops and upcoming sessions (available places count)
  - Filters out past sessions and non-SCHEDULED sessions

### Backend — Sessions

- **Database (V25):** `circuit_sessions` (circuit_id, start_date_time, end_date_time, max_participants, status, notes)
- **CircuitController** endpoints: CRUD for sessions under `/api/circuits/{id}/sessions`
- **Status:** SCHEDULED (default), can be managed by circuit owner

### Backend — Bookings & Stripe Payments

- **Database (V26):** `bookings` (circuit_session_id, user_id, stripe_checkout_id, stripe_payment_id, status, amount_mad, paid_at)
- **BookingService:**
  - `createCheckoutSession()` — validates session availability, capacity, price; creates Stripe Checkout Session in MAD currency; saves PENDING booking
  - `handleWebhook()` — Stripe webhook (`checkout.session.completed`) confirms booking
  - `verifyAndGetBooking()` — direct Stripe verification fallback
  - `getMyBookings()` — lists user's bookings with auto-verification of PENDING ones
- **StripeWebhookController:** `POST /api/webhooks/stripe` (public endpoint)
- **BookingController:** `POST /api/bookings/checkout`, `GET /api/bookings/my`, `GET /api/bookings/verify`

### Frontend

- **ToursPage:** Browse available tours with city filter, session counts, pricing
- **TourDetailPage:** Tour itinerary (stops on map), upcoming sessions with availability, "Book Now" button → Stripe Checkout redirect
- **BookingSuccessPage:** Post-payment confirmation, verifies booking status
- **Dashboard:** User's bookings overview

---

## Suggested Demo Flow (if time permits)

1. **Home page** — show city selection, hero section
2. **Register/Login** — create account, show JWT in action
3. **AI Circuit Wizard** — generate a 2-day Tangier circuit
4. **Circuit Planning** — edit stops, use AI reorder, view on map
5. **Publish as Tour** — set price, create session
6. **Book Tour** — browse tours page, book with Stripe
7. **Admin Dashboard** — manage users, cities, places

---

## Key Numbers to Mention

- **26 database migrations** — iterative, production-ready schema evolution
- **8 Moroccan cities** seeded with real places and coordinates
- **4 languages** supported for city names (EN/FR/AR/AMZ)
- **5 user roles** with granular access control (CUSTOMER plans trips; GUIDE/COMPANY publish & sell tours)
- **3 AI features** powered by Llama 3.3 70B via Groq
- **11 backend services**, **10 controllers**
- **25 frontend pages** across public, auth, dashboard, admin, circuits, tours
- **Stripe integration** for real payment processing in MAD
