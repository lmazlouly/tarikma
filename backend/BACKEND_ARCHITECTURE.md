# Backend Architecture Guide

A simple guide to understand the backend structure, Spring Boot annotations, and how authentication works.

---

## Folder Structure

```
backend/src/main/java/com/tarikma/app/
├── config/         # App settings and security setup
├── controllers/    # API endpoints (where requests come in)
├── dto/            # Data shapes for requests/responses
├── entity/         # Database tables as Java classes
├── exception/      # Error handling
├── repository/     # Database queries
├── service/        # Business logic
└── AppApplication.java  # App entry point
```

### What Each Folder Does

- **config/** - Sets up how the app works: security rules, CORS (who can call the API), JWT tokens, and API docs.

- **controllers/** - Receives HTTP requests from the frontend. Each method handles one endpoint (like `/api/auth/login`).

- **dto/** - "Data Transfer Objects" - simple classes that define what data goes in and out of the API. Keeps internal data separate from what users see.

- **entity/** - Java classes that map to database tables. Each field = a column in the database.

- **exception/** - Custom error types and a global handler that catches all errors and returns nice error messages.

- **repository/** - Interfaces that let you query the database without writing SQL. Spring creates the code for you.

- **service/** - Where the real work happens. Controllers call services, services do the logic, then talk to repositories.

---

## Spring Boot Annotations Explained

### App Setup

| Annotation | What It Does | Example |
|------------|--------------|---------|
| `@SpringBootApplication` | Marks the main class that starts the app | `AppApplication.java` |
| `@Configuration` | This class sets up beans (objects Spring manages) | `SecurityConfig.java` |
| `@Bean` | Creates an object that Spring will manage and inject where needed | `passwordEncoder()` in SecurityConfig |

### Web Layer

| Annotation | What It Does | Example |
|------------|--------------|---------|
| `@RestController` | This class handles HTTP requests and returns JSON | `AuthController.java` |
| `@RequestMapping` | Base URL path for all methods in this class | `@RequestMapping("/api/auth")` |
| `@PostMapping` | Handles POST requests | `@PostMapping("/login")` |
| `@GetMapping` | Handles GET requests | `@GetMapping` in HealthController |
| `@RequestBody` | Takes JSON from request body and converts to Java object | `@RequestBody LoginRequest request` |
| `@Valid` | Validates the request data before processing | `@Valid @RequestBody RegisterRequest` |

### Database Layer

| Annotation | What It Does | Example |
|------------|--------------|---------|
| `@Entity` | This class is a database table | `User.java`, `Role.java` |
| `@Table` | Sets the table name | `@Table(name = "users")` |
| `@Id` | This field is the primary key | `private Long id` |
| `@GeneratedValue` | Auto-generate the ID | `@GeneratedValue(strategy = GenerationType.IDENTITY)` |
| `@Column` | Customize column settings | `@Column(nullable = false, unique = true)` |
| `@ManyToMany` | Relationship: many users can have many roles | User ↔ Role relationship |

### Service Layer

| Annotation | What It Does | Example |
|------------|--------------|---------|
| `@Service` | Marks a class as a service (business logic) | `UserService.java` |
| `@Transactional` | Wraps method in a database transaction (all or nothing) | `register()` method |

### Validation

| Annotation | What It Does | Example |
|------------|--------------|---------|
| `@NotBlank` | Field cannot be empty or null | `username` in LoginRequest |

### Error Handling

| Annotation | What It Does | Example |
|------------|--------------|---------|
| `@RestControllerAdvice` | Global error handler for all controllers | `GlobalExceptionHandler.java` |
| `@ExceptionHandler` | Catches specific exception types | `@ExceptionHandler(NotFoundException.class)` |
| `@ResponseStatus` | Sets HTTP status code for an exception | `@ResponseStatus(HttpStatus.NOT_FOUND)` |

### Security

| Annotation | What It Does | Example |
|------------|--------------|---------|
| `@EnableWebSecurity` | Turns on Spring Security | `SecurityConfig.java` |
| `@Value` | Injects value from config file | `@Value("${app.security.jwt.secret}")` |

---

## How Authentication Works

### Overview

The app uses **JWT (JSON Web Token)** for authentication. This is a stateless approach - the server doesn't store sessions.

### Flow

```
1. User sends username + password to /api/auth/login
                    ↓
2. AuthController receives the request
                    ↓
3. UserService.authenticate() checks credentials
   - Finds user in database
   - Compares password hash
                    ↓
4. JwtService.generateToken() creates a JWT with:
   - Username
   - Role (USER, ADMIN, etc.)
   - Expiration time (60 minutes)
                    ↓
5. Token is sent back to the user
                    ↓
6. User includes token in future requests:
   Header: "Authorization: Bearer <token>"
                    ↓
7. SecurityConfig validates the token automatically
   - Checks signature
   - Checks expiration
   - Extracts user info
```

### Key Components

- **SecurityConfig** - Defines which endpoints are public vs protected:
  - Public: `/api/auth/**`, `/api/health`, `/swagger-ui/**`
  - Protected: Everything else (needs valid JWT)

- **JwtService** - Creates tokens with user info and role

- **UserService** - Handles registration and login logic

- **PasswordEncoder** - Uses BCrypt to hash passwords (never stores plain text)

### Registration Flow

```
1. POST /api/auth/register with username, password, role
                    ↓
2. UserService.register():
   - Checks if username exists
   - Hashes the password
   - Creates or finds the role
   - Saves user to database
                    ↓
3. Returns JWT token (user is logged in immediately)
```

---

## Quick Reference

### Public Endpoints (no token needed)
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get token
- `GET /api/health` - Check if server is running

### Protected Endpoints (token required)
- Everything else

### Config File Location
`src/main/resources/application.yaml`

---

## Summary

| Layer | Purpose | Talks To |
|-------|---------|----------|
| Controller | Receive requests | Service |
| Service | Business logic | Repository |
| Repository | Database access | Database |
| Entity | Data structure | - |
| DTO | API data format | - |
| Config | App settings | - |
| Exception | Error handling | - |
