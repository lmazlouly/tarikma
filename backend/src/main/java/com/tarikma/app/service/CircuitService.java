package com.tarikma.app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tarikma.app.dto.circuit.*;
import com.tarikma.app.entity.*;
import com.tarikma.app.exception.BadRequestException;
import com.tarikma.app.exception.NotFoundException;
import com.tarikma.app.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class CircuitService {

    private static final Logger log = LoggerFactory.getLogger(CircuitService.class);

    private final CircuitRepository circuitRepository;
    private final CircuitStopRepository circuitStopRepository;
    private final CircuitRouteRepository circuitRouteRepository;
    private final TransportOptionRepository transportOptionRepository;
    private final CityRepository cityRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;
    private final AiService aiService;
    private final WeatherService weatherService;
    private final CircuitSessionRepository circuitSessionRepository;

    public CircuitService(
            CircuitRepository circuitRepository,
            CircuitStopRepository circuitStopRepository,
            CircuitRouteRepository circuitRouteRepository,
            TransportOptionRepository transportOptionRepository,
            CityRepository cityRepository,
            PlaceRepository placeRepository,
            UserRepository userRepository,
            AiService aiService,
            WeatherService weatherService,
            CircuitSessionRepository circuitSessionRepository
    ) {
        this.circuitRepository = circuitRepository;
        this.circuitStopRepository = circuitStopRepository;
        this.circuitRouteRepository = circuitRouteRepository;
        this.transportOptionRepository = transportOptionRepository;
        this.cityRepository = cityRepository;
        this.placeRepository = placeRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
        this.weatherService = weatherService;
        this.circuitSessionRepository = circuitSessionRepository;
    }

    @Transactional(readOnly = true)
    public List<CircuitSummaryResponse> listMyCircuits(String userEmail, Long cityId) {
        User user = findUserByEmailOrThrow(userEmail);

        List<Circuit> circuits = cityId == null
                ? circuitRepository.findByCreatedById(user.getId())
                : circuitRepository.findByCreatedByIdAndCityId(user.getId(), cityId);

        return circuits.stream()
                .sorted(Comparator.comparing(Circuit::getCreatedAt).reversed())
                .map(c -> toCircuitSummaryResponse(c, circuitStopRepository.countByCircuitId(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public CircuitResponse getMyCircuit(Long circuitId, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        Circuit circuit = findOwnedCircuitOrThrow(circuitId, user.getId());

        CircuitResponse r = toCircuitResponseBase(circuit);
        r.setStops(circuitStopRepository.findByCircuitIdOrderByPositionAsc(circuitId).stream()
                .map(this::toStopResponse)
                .toList());
        r.setRoutes(circuitRouteRepository.findByCircuitId(circuitId).stream()
                .map(this::toRouteResponse)
                .toList());
        return r;
    }

    @Transactional(readOnly = true)
    public List<CircuitPlanningWarningResponse> getMyCircuitPlanningWarnings(Long circuitId, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        findOwnedCircuitOrThrow(circuitId, user.getId());

        List<CircuitStop> stops = circuitStopRepository.findByCircuitIdOrderByPositionAsc(circuitId);

        List<CircuitPlanningWarningResponse> warnings = new ArrayList<>();
        Map<Integer, List<CircuitStop>> byDay = new TreeMap<>();

        for (CircuitStop s : stops) {
            if (s.getDayNumber() != null) {
                byDay.computeIfAbsent(s.getDayNumber(), k -> new ArrayList<>()).add(s);
            }

            if (s.getDayNumber() != null && (s.getStartTime() == null || s.getEndTime() == null)) {
                warnings.add(createWarning(
                        "TIME_WINDOW_NOT_SET",
                        "Stop has dayNumber but no startTime/endTime",
                        "INFO",
                        s.getDayNumber(),
                        s.getId()
                ));
            }

            if ("EAT".equals(s.getStopKind()) && s.getMealType() == null) {
                warnings.add(createWarning(
                        "MEAL_TYPE_NOT_SET",
                        "Meal stop is missing mealType (BREAKFAST/LUNCH/DINNER)",
                        "INFO",
                        s.getDayNumber(),
                        s.getId()
                ));
            }
        }

        for (Map.Entry<Integer, List<CircuitStop>> e : byDay.entrySet()) {
            Integer dayNumber = e.getKey();
            List<CircuitStop> dayStops = e.getValue();

            boolean hasSleep = false;
            boolean hasAnyEat = false;
            boolean hasBreakfast = false;
            boolean hasLunch = false;
            boolean hasDinner = false;

            for (CircuitStop s : dayStops) {
                if ("SLEEP".equals(s.getStopKind())) hasSleep = true;

                if ("EAT".equals(s.getStopKind())) {
                    hasAnyEat = true;
                    if ("BREAKFAST".equals(s.getMealType())) hasBreakfast = true;
                    if ("LUNCH".equals(s.getMealType())) hasLunch = true;
                    if ("DINNER".equals(s.getMealType())) hasDinner = true;
                }
            }

            if (!hasSleep) {
                warnings.add(createWarning(
                        "SLEEP_MISSING",
                        "No sleep stop on day " + dayNumber,
                        "INFO",
                        dayNumber,
                        null
                ));
            }

            if (!hasAnyEat) {
                warnings.add(createWarning(
                        "EAT_MISSING",
                        "No meal stop on day " + dayNumber,
                        "INFO",
                        dayNumber,
                        null
                ));
            } else {
                if (!hasBreakfast) {
                    warnings.add(createWarning(
                            "BREAKFAST_MISSING",
                            "No breakfast on day " + dayNumber,
                            "INFO",
                            dayNumber,
                            null
                    ));
                }
                if (!hasLunch) {
                    warnings.add(createWarning(
                            "LUNCH_MISSING",
                            "No lunch on day " + dayNumber,
                            "INFO",
                            dayNumber,
                            null
                    ));
                }
                if (!hasDinner) {
                    warnings.add(createWarning(
                            "DINNER_MISSING",
                            "No dinner on day " + dayNumber,
                            "INFO",
                            dayNumber,
                            null
                    ));
                }
            }
        }

        warnings.sort(Comparator
                .comparing(CircuitPlanningWarningResponse::getDayNumber, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(CircuitPlanningWarningResponse::getStopId, Comparator.nullsLast(Long::compareTo))
                .thenComparing(CircuitPlanningWarningResponse::getCode)
        );
        return warnings;
    }

    @Transactional
    public CircuitResponse createCircuit(CreateCircuitRequest req, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        City city = findCityOrThrow(req.getCityId());

        Circuit circuit = new Circuit();
        circuit.setCity(city);
        circuit.setName(req.getName().trim());
        circuit.setNotes(req.getNotes());
        circuit.setPriceMad(req.getPriceMad());
        circuit.setCreatedBy(user);

        circuit = circuitRepository.save(circuit);
        return toCircuitResponseBase(circuit);
    }

    @Transactional
    public CircuitResponse updateCircuit(Long circuitId, UpdateCircuitRequest req, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        Circuit circuit = findOwnedCircuitOrThrow(circuitId, user.getId());

        if (req.getName() != null) {
            String name = req.getName().trim();
            if (name.isBlank()) throw new BadRequestException("Name cannot be blank");
            circuit.setName(name);
        }
        if (req.getNotes() != null) {
            circuit.setNotes(req.getNotes());
        }
        if (req.getPriceMad() != null) {
            circuit.setPriceMad(req.getPriceMad());
        }

        circuit = circuitRepository.save(circuit);
        return toCircuitResponseBase(circuit);
    }

    @Transactional
    public void deleteCircuit(Long circuitId, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        Circuit circuit = findOwnedCircuitOrThrow(circuitId, user.getId());
        circuitRepository.delete(circuit);
    }

    @Transactional
    public CircuitResponse addStop(Long circuitId, AddCircuitStopRequest req, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        Circuit circuit = findOwnedCircuitOrThrow(circuitId, user.getId());
        Place place = findPlaceOrThrow(req.getPlaceId());

        if (!place.getCity().getId().equals(circuit.getCity().getId())) {
            throw new BadRequestException("Place does not belong to this circuit's city");
        }

        if (circuitStopRepository.existsByCircuitIdAndPlaceId(circuitId, place.getId())) {
            throw new BadRequestException("This place is already a stop in the circuit");
        }

        int targetPosition = resolveTargetPositionForInsert(circuitId, req.getPosition());

        if (req.getPosition() != null) {
            shiftPositionsForInsert(circuitId, targetPosition);
        }

        CircuitStop stop = new CircuitStop();
        stop.setCircuit(circuit);
        stop.setPlace(place);
        stop.setPosition(targetPosition);

        Integer dayNumber = req.getDayNumber();
        String stopKind = normalizeStopKind(req.getStopKind());
        String mealType = normalizeMealType(req.getMealType());
        if (mealType != null && stopKind == null) {
            stopKind = "EAT";
        }
        validateStopSchedule(dayNumber, stopKind, mealType, req.getStartTime(), req.getEndTime());
        validateNoOverlappingTimeWindows(circuitId, null, dayNumber, req.getStartTime(), req.getEndTime());

        stop.setDayNumber(dayNumber);
        stop.setStopKind(stopKind);
        stop.setMealType(mealType);
        stop.setStartTime(req.getStartTime());
        stop.setEndTime(req.getEndTime());
        stop.setDurationMinutes(req.getDurationMinutes());
        stop.setNotes(req.getNotes());
        circuitStopRepository.save(stop);

        return getMyCircuit(circuitId, userEmail);
    }

    @Transactional
    public CircuitResponse updateStop(Long circuitId, Long stopId, UpdateCircuitStopRequest req, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        findOwnedCircuitOrThrow(circuitId, user.getId());

        CircuitStop stop = findStopOrThrow(stopId);
        if (!stop.getCircuit().getId().equals(circuitId)) {
            throw new NotFoundException("Circuit stop not found");
        }

        if (req.getDayNumber() != null) {
            stop.setDayNumber(req.getDayNumber());
        }

        if (req.getStopKind() != null) {
            stop.setStopKind(normalizeStopKind(req.getStopKind()));
        }

        if (req.getMealType() != null) {
            stop.setMealType(normalizeMealType(req.getMealType()));
        }

        if (req.getStartTime() != null) {
            stop.setStartTime(req.getStartTime());
        }

        if (req.getEndTime() != null) {
            stop.setEndTime(req.getEndTime());
        }

        if (req.getDurationMinutes() != null) {
            stop.setDurationMinutes(req.getDurationMinutes());
        }

        if (req.getNotes() != null) {
            stop.setNotes(req.getNotes());
        }

        String stopKind = stop.getStopKind();
        String mealType = stop.getMealType();
        if (mealType != null && stopKind == null) {
            stopKind = "EAT";
            stop.setStopKind(stopKind);
        }
        validateStopSchedule(stop.getDayNumber(), stopKind, mealType, stop.getStartTime(), stop.getEndTime());
        validateNoOverlappingTimeWindows(circuitId, stop.getId(), stop.getDayNumber(), stop.getStartTime(), stop.getEndTime());

        if (req.getPosition() != null) {
            int newPos = req.getPosition();
            if (newPos <= 0) throw new BadRequestException("Position must be > 0");
            repositionStop(circuitId, stop, newPos);
        } else {
            circuitStopRepository.save(stop);
        }

        return getMyCircuit(circuitId, userEmail);
    }

    @Transactional
    public CircuitResponse deleteStop(Long circuitId, Long stopId, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        findOwnedCircuitOrThrow(circuitId, user.getId());

        CircuitStop stop = findStopOrThrow(stopId);
        if (!stop.getCircuit().getId().equals(circuitId)) {
            throw new NotFoundException("Circuit stop not found");
        }

        int removedPos = stop.getPosition();
        circuitStopRepository.delete(stop);

        List<CircuitStop> toShift = circuitStopRepository.findByCircuitIdOrderByPositionAsc(circuitId).stream()
                .filter(s -> s.getPosition() > removedPos)
                .toList();

        for (CircuitStop s : toShift) {
            s.setPosition(s.getPosition() - 1);
        }
        circuitStopRepository.saveAll(toShift);

        return getMyCircuit(circuitId, userEmail);
    }

    @Transactional
    public CircuitResponse upsertRoute(Long circuitId, UpsertCircuitRouteRequest req, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        findOwnedCircuitOrThrow(circuitId, user.getId());

        if (req.getFromStopId().equals(req.getToStopId())) {
            throw new BadRequestException("fromStopId and toStopId cannot be the same");
        }

        CircuitStop fromStop = findStopOrThrow(req.getFromStopId());
        CircuitStop toStop = findStopOrThrow(req.getToStopId());

        if (!fromStop.getCircuit().getId().equals(circuitId) || !toStop.getCircuit().getId().equals(circuitId)) {
            throw new BadRequestException("Stops must belong to the same circuit");
        }

        CircuitRoute route = circuitRouteRepository
                .findByCircuitIdAndFromStopIdAndToStopId(circuitId, req.getFromStopId(), req.getToStopId())
                .orElseGet(() -> {
                    CircuitRoute r = new CircuitRoute();
                    r.setCircuit(fromStop.getCircuit());
                    r.setFromStop(fromStop);
                    r.setToStop(toStop);
                    return r;
                });

        if (req.getTransportOptionId() != null) {
            TransportOption option = transportOptionRepository.findById(req.getTransportOptionId())
                    .orElseThrow(() -> new NotFoundException("Transport option not found"));

            boolean directMatch = option.getFromPlace().getId().equals(fromStop.getPlace().getId())
                    && option.getToPlace().getId().equals(toStop.getPlace().getId());
            boolean reverseMatch = option.isBidirectional()
                    && option.getFromPlace().getId().equals(toStop.getPlace().getId())
                    && option.getToPlace().getId().equals(fromStop.getPlace().getId());

            if (!directMatch && !reverseMatch) {
                throw new BadRequestException("Transport option does not match this route's places");
            }

            route.setTransportOption(option);

            if (route.getTransportMode() == null) route.setTransportMode(option.getMode());
            if (route.getDistanceKm() == null) route.setDistanceKm(option.getDistanceKm());
            if (route.getDurationMinutes() == null) route.setDurationMinutes(option.getDurationMinutes());
        }

        if (req.getTransportMode() != null) route.setTransportMode(req.getTransportMode());
        if (req.getDistanceKm() != null) route.setDistanceKm(req.getDistanceKm());
        if (req.getDurationMinutes() != null) route.setDurationMinutes(req.getDurationMinutes());

        circuitRouteRepository.save(route);
        return getMyCircuit(circuitId, userEmail);
    }

    @Transactional
    public CircuitResponse reorderStopsWithAi(Long circuitId, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        Circuit circuit = findOwnedCircuitOrThrow(circuitId, user.getId());

        if (!aiService.isConfigured()) {
            throw new BadRequestException("AI service is not configured");
        }

        List<CircuitStop> stops = circuitStopRepository.findByCircuitIdOrderByPositionAsc(circuitId);
        if (stops.size() < 2) {
            throw new BadRequestException("Need at least 2 stops to rearrange");
        }

        String cityName = getPrimaryCityName(circuit.getCity());

        StringBuilder stopsJson = new StringBuilder("[\n");
        for (int i = 0; i < stops.size(); i++) {
            CircuitStop s = stops.get(i);
            Place p = s.getPlace();
            if (i > 0) stopsJson.append(",\n");
            stopsJson.append(String.format(
                    "  {\"id\": %d, \"name\": \"%s\", \"category\": \"%s\", \"lat\": %s, \"lng\": %s, \"stopKind\": \"%s\", \"dayNumber\": %s}",
                    s.getId(),
                    p.getName().replace("\"", "\\\""),
                    p.getCategory() != null ? p.getCategory() : "",
                    p.getLatitude() != null ? p.getLatitude().toString() : "null",
                    p.getLongitude() != null ? p.getLongitude().toString() : "null",
                    s.getStopKind() != null ? s.getStopKind() : "",
                    s.getDayNumber() != null ? s.getDayNumber().toString() : "null"
            ));
        }
        stopsJson.append("\n]");

        String systemPrompt = "You are a Moroccan travel route optimizer. " +
                "Given a list of circuit stops in a Moroccan city, reorder them for the most efficient and enjoyable tourist route. " +
                "Consider: geographic proximity to minimize travel distance, logical flow (e.g., start from a central point, " +
                "group nearby attractions), meal stops at appropriate times, and sleep stops at the end of the day. " +
                "Respond ONLY with valid JSON in this exact format: " +
                "{\"ordered_ids\": [id1, id2, ...], \"explanation\": \"Brief reason for this order\"}";

        String userPrompt = String.format(
                "Reorder these stops for an optimal tourist circuit in %s, Morocco:\n%s",
                cityName != null ? cityName : "the city",
                stopsJson
        );

        try {
            String aiResponse = aiService.chatCompletion(systemPrompt, userPrompt);
            log.info("AI reorder response for circuit {}: {}", circuitId, aiResponse);

            String jsonContent = aiResponse.trim();
            int braceStart = jsonContent.indexOf('{');
            int braceEnd = jsonContent.lastIndexOf('}');
            if (braceStart >= 0 && braceEnd > braceStart) {
                jsonContent = jsonContent.substring(braceStart, braceEnd + 1);
            }

            List<Long> newOrder = parseOrderedIds(jsonContent);

            if (newOrder.size() != stops.size()) {
                throw new BadRequestException("AI returned invalid number of stops");
            }

            // Validate all IDs match
            List<Long> existingIds = stops.stream().map(CircuitStop::getId).sorted().toList();
            List<Long> sortedNewOrder = newOrder.stream().sorted().toList();
            if (!existingIds.equals(sortedNewOrder)) {
                throw new BadRequestException("AI returned mismatched stop IDs");
            }

            // Apply new positions
            for (int i = 0; i < newOrder.size(); i++) {
                Long stopId = newOrder.get(i);
                CircuitStop stop = stops.stream()
                        .filter(s -> s.getId().equals(stopId))
                        .findFirst()
                        .orElseThrow();
                stop.setPosition(i + 1);
            }
            circuitStopRepository.saveAll(stops);

            return getMyCircuit(circuitId, userEmail);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI reorder failed for circuit {}", circuitId, e);
            throw new BadRequestException("AI reorder failed: " + e.getMessage());
        }
    }

    @Transactional
    public CircuitResponse generateCircuitWithAi(AiGenerateCircuitRequest req, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        City city = findCityOrThrow(req.getCityId());

        if (!aiService.isConfigured()) {
            throw new BadRequestException("AI service is not configured");
        }

        String cityName = getPrimaryCityName(city);
        int numberOfDays = req.getNumberOfDays();
        List<String> interests = req.getInterests() != null ? req.getInterests() : List.of();
        String travelDate = req.getTravelDate();

        // Fetch weather info
        String weatherInfo = "No weather data.";
        if (travelDate != null && !travelDate.isBlank()) {
            weatherInfo = weatherService.getWeatherSummary(cityName, travelDate);
        }

        // Get all places in this city
        List<Place> places = placeRepository.findByCityId(city.getId());
        if (places.isEmpty()) {
            throw new BadRequestException("No places available in this city to build a circuit");
        }

        // Build places JSON for the AI
        StringBuilder placesJson = new StringBuilder("[\n");
        for (int i = 0; i < places.size(); i++) {
            Place p = places.get(i);
            if (i > 0) placesJson.append(",\n");
            placesJson.append(String.format(
                    "  {\"id\": %d, \"name\": \"%s\", \"category\": \"%s\", \"lat\": %s, \"lng\": %s}",
                    p.getId(),
                    p.getName().replace("\"", "\\\""),
                    p.getCategory() != null ? p.getCategory() : "",
                    p.getLatitude() != null ? p.getLatitude().toString() : "null",
                    p.getLongitude() != null ? p.getLongitude().toString() : "null"
            ));
        }
        placesJson.append("\n]");

        String systemPrompt = "You are a Moroccan travel planner AI. " +
                "Given a list of available places in a Moroccan city, the number of days, traveler interests, and weather forecast, " +
                "create an optimal day-by-day circuit plan. " +
                "For each stop, assign: the place id, day number, stop kind (VISIT, EAT, or SLEEP), " +
                "meal type (BREAKFAST, LUNCH, or DINNER — only when stopKind is EAT), " +
                "estimated duration in minutes, and a suggested start time (HH:mm format). " +
                "Each day should have a logical flow: breakfast → morning visits → lunch → afternoon visits → dinner → sleep. " +
                "Consider weather (prefer indoor places if rainy), geographic proximity, and the traveler's interests. " +
                "Pick only from the provided place IDs. Do NOT invent new places. " +
                "Respond ONLY with valid JSON in this exact format:\n" +
                "{\"circuit_name\": \"Short descriptive name\", \"stops\": [\n" +
                "  {\"place_id\": 1, \"day_number\": 1, \"position\": 1, \"stop_kind\": \"VISIT\", \"meal_type\": null, \"duration_minutes\": 60, \"start_time\": \"09:00\"},\n" +
                "  ...\n" +
                "]}";

        String userPrompt = String.format(
                "Plan a %d-day tourist circuit in %s, Morocco.\n" +
                "Traveler interests: %s\n" +
                "Weather: %s\n" +
                "Available places:\n%s",
                numberOfDays,
                cityName != null ? cityName : "the city",
                interests.isEmpty() ? "General sightseeing" : String.join(", ", interests),
                weatherInfo,
                placesJson
        );

        String aiResponse = null;
        try {
            aiResponse = aiService.chatCompletion(systemPrompt, userPrompt);
            log.info("AI generate circuit response: {}", aiResponse);

            // Extract JSON
            String jsonContent = aiResponse
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();
            int braceStart = jsonContent.indexOf('{');
            int braceEnd = jsonContent.lastIndexOf('}');
            if (braceStart >= 0 && braceEnd > braceStart) {
                jsonContent = jsonContent.substring(braceStart, braceEnd + 1);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(jsonContent);

            // Parse circuit name
            JsonNode circuitNameNode = root.get("circuit_name");
            String circuitName = circuitNameNode != null ? circuitNameNode.asText() : null;
            if (circuitName == null || circuitName.isBlank()) {
                circuitName = cityName + " " + numberOfDays + "-day circuit";
            }

            // Create the circuit
            Circuit circuit = new Circuit();
            circuit.setCity(city);
            circuit.setName(circuitName);
            circuit.setNotes("Generated by AI based on interests: " + (interests.isEmpty() ? "general" : String.join(", ", interests)));
            circuit.setCreatedBy(user);
            circuit = circuitRepository.save(circuit);

            // Parse stops array
            JsonNode stopsNode = root.get("stops");
            if (stopsNode == null || !stopsNode.isArray()) {
                throw new BadRequestException("AI response missing stops array");
            }

            List<CircuitStop> createdStops = new ArrayList<>();

            for (JsonNode stopNode : stopsNode) {
                Long placeId = stopNode.hasNonNull("place_id") ? stopNode.get("place_id").asLong() : null;
                Integer dayNumber = stopNode.hasNonNull("day_number") ? stopNode.get("day_number").asInt() : null;
                Integer position = stopNode.hasNonNull("position") ? stopNode.get("position").asInt() : null;
                String stopKind = stopNode.hasNonNull("stop_kind") ? stopNode.get("stop_kind").asText() : null;
                String mealType = stopNode.hasNonNull("meal_type") ? stopNode.get("meal_type").asText() : null;
                Integer durationMinutes = stopNode.hasNonNull("duration_minutes") ? stopNode.get("duration_minutes").asInt() : null;
                String startTimeStr = stopNode.hasNonNull("start_time") ? stopNode.get("start_time").asText() : null;

                if (placeId != null && position != null) {
                    // Validate place exists and belongs to city
                    Place place = places.stream()
                            .filter(p -> p.getId().equals(placeId))
                            .findFirst()
                            .orElse(null);

                    if (place != null) {
                        CircuitStop stop = new CircuitStop();
                        stop.setCircuit(circuit);
                        stop.setPlace(place);
                        stop.setPosition(position);
                        stop.setDayNumber(dayNumber);
                        stop.setStopKind(normalizeStopKind(stopKind));
                        stop.setMealType(normalizeMealType(mealType));
                        stop.setDurationMinutes(durationMinutes);

                        if (startTimeStr != null && startTimeStr.matches("\\d{2}:\\d{2}")) {
                            LocalTime startTime = LocalTime.parse(startTimeStr);
                            stop.setStartTime(startTime);
                            if (durationMinutes != null) {
                                stop.setEndTime(startTime.plusMinutes(durationMinutes));
                            }
                        }

                        createdStops.add(stop);
                    }
                }
            }

            if (createdStops.isEmpty()) {
                circuitRepository.delete(circuit);
                throw new BadRequestException("AI failed to generate valid stops");
            }

            circuitStopRepository.saveAll(createdStops);

            return getMyCircuit(circuit.getId(), userEmail);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            if (aiResponse != null) {
                log.error("AI circuit generation failed. Raw AI response: {}", aiResponse);
            }
            log.error("AI circuit generation failed", e);
            throw new BadRequestException("AI circuit generation failed: " + e.getMessage());
        }
    }

    @Transactional
    public CircuitResponse suggestPlacesWithAi(Long circuitId, AiSuggestPlacesRequest req, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        Circuit circuit = findOwnedCircuitOrThrow(circuitId, user.getId());

        if (!aiService.isConfigured()) {
            throw new BadRequestException("AI service is not configured");
        }

        City city = circuit.getCity();
        String cityName = getPrimaryCityName(city);
        int count = req.getCount() != null ? req.getCount() : 5;
        String preferences = req.getPreferences();

        List<Place> existingPlaces = placeRepository.findByCityId(city.getId());
        List<CircuitStop> existingStops = circuitStopRepository.findByCircuitIdOrderByPositionAsc(circuitId);

        StringBuilder existingJson = new StringBuilder("[\n");
        for (int i = 0; i < existingPlaces.size(); i++) {
            Place p = existingPlaces.get(i);
            if (i > 0) existingJson.append(",\n");
            existingJson.append(String.format(
                    "  {\"id\": %d, \"name\": \"%s\", \"category\": \"%s\"}",
                    p.getId(),
                    p.getName().replace("\"", "\\\""),
                    p.getCategory() != null ? p.getCategory() : ""
            ));
        }
        existingJson.append("\n]");

        StringBuilder currentStopsJson = new StringBuilder("[\n");
        for (int i = 0; i < existingStops.size(); i++) {
            CircuitStop s = existingStops.get(i);
            if (i > 0) currentStopsJson.append(",\n");
            currentStopsJson.append(String.format(
                    "  {\"name\": \"%s\", \"category\": \"%s\"}",
                    s.getPlace().getName().replace("\"", "\\\""),
                    s.getPlace().getCategory() != null ? s.getPlace().getCategory() : ""
            ));
        }
        currentStopsJson.append("\n]");

        String systemPrompt = "You are a Moroccan travel expert. " +
                "Given a city in Morocco, suggest NEW real places that tourists should visit. " +
                "These must be real, existing places with accurate GPS coordinates. " +
                "Do NOT suggest places that already exist in the provided lists. " +
                "For each place, provide: name, category (one of: RESTAURANT, CAFE, HOTEL, MUSEUM, MOSQUE, PARK, BEACH, MARKET, MONUMENT, HISTORIC, LANDMARK, NATURE), " +
                "a short description, address, and accurate latitude/longitude coordinates. " +
                "Respond ONLY with valid JSON in this exact format:\n" +
                "{\"places\": [\n" +
                "  {\"name\": \"Place Name\", \"category\": \"RESTAURANT\", \"description\": \"Short description\", \"address\": \"Street address\", \"latitude\": 35.785, \"longitude\": -5.813}\n" +
                "]}";

        String userPrompt = String.format(
                "Suggest %d new places to visit in %s, Morocco.\n" +
                "%s" +
                "Already existing places (do NOT repeat these):\n%s\n" +
                "Current circuit stops (suggest complementary places):\n%s",
                count,
                cityName != null ? cityName : "the city",
                preferences != null && !preferences.isBlank() ? "Preferences: " + preferences + "\n" : "",
                existingJson,
                currentStopsJson
        );

        String aiResponse = null;
        try {
            aiResponse = aiService.chatCompletion(systemPrompt, userPrompt);
            log.info("AI suggest places response for circuit {}: {}", circuitId, aiResponse);

            String jsonContent = aiResponse
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();
            int braceStart = jsonContent.indexOf('{');
            int braceEnd = jsonContent.lastIndexOf('}');
            if (braceStart >= 0 && braceEnd > braceStart) {
                jsonContent = jsonContent.substring(braceStart, braceEnd + 1);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(jsonContent);
            JsonNode placesNode = root.get("places");

            if (placesNode == null || !placesNode.isArray()) {
                throw new BadRequestException("AI response missing places array");
            }

            int lastPos = circuitStopRepository.findTopByCircuitIdOrderByPositionDesc(circuitId)
                    .map(CircuitStop::getPosition)
                    .orElse(0);

            List<CircuitStop> newStops = new ArrayList<>();

            for (JsonNode placeNode : placesNode) {
                String name = placeNode.hasNonNull("name") ? placeNode.get("name").asText() : null;
                String category = placeNode.hasNonNull("category") ? placeNode.get("category").asText() : null;
                String description = placeNode.hasNonNull("description") ? placeNode.get("description").asText() : null;
                String address = placeNode.hasNonNull("address") ? placeNode.get("address").asText() : null;
                Double latitude = placeNode.hasNonNull("latitude") ? placeNode.get("latitude").asDouble() : null;
                Double longitude = placeNode.hasNonNull("longitude") ? placeNode.get("longitude").asDouble() : null;

                if (name == null || name.isBlank() || latitude == null || longitude == null) {
                    continue;
                }

                Place place = new Place();
                place.setCity(city);
                place.setName(name.trim());
                place.setCategory(category);
                place.setDescription(description);
                place.setAddress(address);
                place.setLatitude(latitude);
                place.setLongitude(longitude);
                place.setCreatedBy(user);
                place = placeRepository.save(place);

                lastPos++;
                CircuitStop stop = new CircuitStop();
                stop.setCircuit(circuit);
                stop.setPlace(place);
                stop.setPosition(lastPos);
                stop.setStopKind("VISIT");
                newStops.add(stop);
            }

            if (newStops.isEmpty()) {
                throw new BadRequestException("AI failed to suggest valid places");
            }

            circuitStopRepository.saveAll(newStops);
            return getMyCircuit(circuitId, userEmail);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            if (aiResponse != null) {
                log.error("AI suggest places failed. Raw AI response: {}", aiResponse);
            }
            log.error("AI suggest places failed for circuit {}", circuitId, e);
            throw new BadRequestException("AI suggest places failed: " + e.getMessage());
        }
    }

    private List<Long> parseOrderedIds(String json) {
        String key = "\"ordered_ids\"";
        int idx = json.indexOf(key);
        if (idx < 0) throw new BadRequestException("AI response missing ordered_ids");

        int bracketStart = json.indexOf('[', idx);
        if (bracketStart < 0) throw new BadRequestException("AI response missing ordered_ids array");

        int bracketEnd = json.indexOf(']', bracketStart);
        if (bracketEnd < 0) throw new BadRequestException("AI response has unterminated ordered_ids array");

        String arrayContent = json.substring(bracketStart + 1, bracketEnd).trim();
        if (arrayContent.isEmpty()) return new ArrayList<>();

        List<Long> ids = new ArrayList<>();
        for (String part : arrayContent.split(",")) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                ids.add(Long.parseLong(trimmed));
            }
        }
        return ids;
    }

    private int resolveTargetPositionForInsert(Long circuitId, Integer requestedPosition) {
        int lastPos = circuitStopRepository.findTopByCircuitIdOrderByPositionDesc(circuitId)
                .map(CircuitStop::getPosition)
                .orElse(0);

        if (requestedPosition == null) {
            return lastPos + 1;
        }

        if (requestedPosition <= 0) throw new BadRequestException("Position must be > 0");

        int maxAllowed = lastPos + 1;
        if (requestedPosition > maxAllowed) {
            return maxAllowed;
        }

        return requestedPosition;
    }

    private void shiftPositionsForInsert(Long circuitId, int position) {
        List<CircuitStop> stops = circuitStopRepository.findByCircuitIdOrderByPositionAsc(circuitId).stream()
                .filter(s -> s.getPosition() >= position)
                .sorted(Comparator.comparing(CircuitStop::getPosition).reversed())
                .toList();

        for (CircuitStop s : stops) {
            s.setPosition(s.getPosition() + 1);
        }

        circuitStopRepository.saveAll(stops);
    }

    private void repositionStop(Long circuitId, CircuitStop moving, int requestedPosition) {
        List<CircuitStop> allStops = circuitStopRepository.findByCircuitIdOrderByPositionAsc(circuitId);
        if (allStops.isEmpty()) return;

        int oldPos = moving.getPosition();
        int maxPos = allStops.getLast().getPosition();

        int newPos = requestedPosition;
        if (newPos > maxPos) newPos = maxPos;

        if (newPos == oldPos) {
            circuitStopRepository.save(moving);
            return;
        }

        if (newPos < oldPos) {
            for (CircuitStop s : allStops) {
                if (s.getId().equals(moving.getId())) continue;
                int p = s.getPosition();
                if (p >= newPos && p < oldPos) {
                    s.setPosition(p + 1);
                }
            }
        } else {
            for (CircuitStop s : allStops) {
                if (s.getId().equals(moving.getId())) continue;
                int p = s.getPosition();
                if (p > oldPos && p <= newPos) {
                    s.setPosition(p - 1);
                }
            }
        }

        moving.setPosition(newPos);
        circuitStopRepository.saveAll(allStops);
    }

    // ── Circuit Sessions ──────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CircuitSessionResponse> listSessions(Long circuitId, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        findOwnedCircuitOrThrow(circuitId, user.getId());

        return circuitSessionRepository.findByCircuitIdOrderByStartDateTimeAsc(circuitId)
                .stream()
                .map(this::toSessionResponse)
                .toList();
    }

    @Transactional
    public CircuitSessionResponse createSession(Long circuitId, CreateCircuitSessionRequest req, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        Circuit circuit = findOwnedCircuitOrThrow(circuitId, user.getId());

        if (req.getEndDateTime() != null && !req.getEndDateTime().isAfter(req.getStartDateTime())) {
            throw new BadRequestException("End date/time must be after start date/time");
        }

        CircuitSession session = new CircuitSession();
        session.setCircuit(circuit);
        session.setStartDateTime(req.getStartDateTime());
        session.setEndDateTime(req.getEndDateTime());
        session.setMaxParticipants(req.getMaxParticipants());
        session.setNotes(req.getNotes());

        return toSessionResponse(circuitSessionRepository.save(session));
    }

    @Transactional
    public CircuitSessionResponse updateSession(Long circuitId, Long sessionId, UpdateCircuitSessionRequest req, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        findOwnedCircuitOrThrow(circuitId, user.getId());

        CircuitSession session = circuitSessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));
        if (!session.getCircuit().getId().equals(circuitId)) {
            throw new BadRequestException("Session does not belong to this circuit");
        }

        if (req.getStartDateTime() != null) {
            session.setStartDateTime(req.getStartDateTime());
        }
        if (req.getEndDateTime() != null) {
            if (!req.getEndDateTime().isAfter(session.getStartDateTime())) {
                throw new BadRequestException("End date/time must be after start date/time");
            }
            session.setEndDateTime(req.getEndDateTime());
        }
        if (req.getMaxParticipants() != null) {
            session.setMaxParticipants(req.getMaxParticipants());
        }
        if (req.getNotes() != null) {
            session.setNotes(req.getNotes());
        }
        if (req.getStatus() != null) {
            String status = req.getStatus().trim().toUpperCase();
            if (!status.equals("SCHEDULED") && !status.equals("CANCELLED") && !status.equals("COMPLETED") && !status.equals("IN_PROGRESS")) {
                throw new BadRequestException("Invalid status. Must be one of: SCHEDULED, CANCELLED, COMPLETED, IN_PROGRESS");
            }
            session.setStatus(status);
        }

        return toSessionResponse(circuitSessionRepository.save(session));
    }

    @Transactional
    public void deleteSession(Long circuitId, Long sessionId, String userEmail) {
        User user = findUserByEmailOrThrow(userEmail);
        findOwnedCircuitOrThrow(circuitId, user.getId());

        CircuitSession session = circuitSessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));
        if (!session.getCircuit().getId().equals(circuitId)) {
            throw new BadRequestException("Session does not belong to this circuit");
        }

        circuitSessionRepository.delete(session);
    }

    private CircuitSessionResponse toSessionResponse(CircuitSession s) {
        CircuitSessionResponse r = new CircuitSessionResponse();
        r.setId(s.getId());
        r.setCircuitId(s.getCircuit().getId());
        r.setStartDateTime(s.getStartDateTime());
        r.setEndDateTime(s.getEndDateTime());
        r.setMaxParticipants(s.getMaxParticipants());
        r.setNotes(s.getNotes());
        r.setStatus(s.getStatus());
        r.setCreatedAt(s.getCreatedAt());
        return r;
    }

    private CircuitSummaryResponse toCircuitSummaryResponse(Circuit c, long stopCount) {
        CircuitSummaryResponse r = new CircuitSummaryResponse();
        r.setId(c.getId());
        r.setCityId(c.getCity().getId());
        r.setCityName(getPrimaryCityName(c.getCity()));
        r.setName(c.getName());
        r.setNotes(c.getNotes());
        r.setPriceMad(c.getPriceMad());
        r.setCreatedAt(c.getCreatedAt());
        r.setStopCount(stopCount);
        return r;
    }

    private CircuitResponse toCircuitResponseBase(Circuit c) {
        CircuitResponse r = new CircuitResponse();
        r.setId(c.getId());
        r.setCityId(c.getCity().getId());
        r.setCityName(getPrimaryCityName(c.getCity()));
        r.setName(c.getName());
        r.setNotes(c.getNotes());
        r.setPriceMad(c.getPriceMad());
        r.setCreatedAt(c.getCreatedAt());
        r.setCreatedBy(c.getCreatedBy().getId());
        return r;
    }

    private CircuitStopResponse toStopResponse(CircuitStop stop) {
        Place p = stop.getPlace();

        CircuitStopResponse r = new CircuitStopResponse();
        r.setId(stop.getId());
        r.setPosition(stop.getPosition());
        r.setDayNumber(stop.getDayNumber());
        r.setStopKind(stop.getStopKind());
        r.setMealType(stop.getMealType());
        r.setStartTime(stop.getStartTime());
        r.setEndTime(stop.getEndTime());
        r.setDurationMinutes(stop.getDurationMinutes());
        r.setNotes(stop.getNotes());
        r.setPlaceId(p.getId());
        r.setPlaceName(p.getName());
        r.setPlaceCategory(p.getCategory());
        r.setPlaceImage(p.getImage());
        r.setPlaceAddress(p.getAddress());
        r.setPlaceLatitude(p.getLatitude());
        r.setPlaceLongitude(p.getLongitude());
        return r;
    }

    private CircuitRouteResponse toRouteResponse(CircuitRoute route) {
        CircuitRouteResponse r = new CircuitRouteResponse();
        r.setId(route.getId());
        r.setFromStopId(route.getFromStop().getId());
        r.setToStopId(route.getToStop().getId());
        r.setTransportOptionId(route.getTransportOption() == null ? null : route.getTransportOption().getId());
        r.setTransportMode(route.getTransportMode());
        r.setDistanceKm(route.getDistanceKm());
        r.setDurationMinutes(route.getDurationMinutes());
        return r;
    }

    private CircuitPlanningWarningResponse createWarning(
            String code,
            String message,
            String severity,
            Integer dayNumber,
            Long stopId
    ) {
        CircuitPlanningWarningResponse r = new CircuitPlanningWarningResponse();
        r.setCode(code);
        r.setMessage(message);
        r.setSeverity(severity);
        r.setDayNumber(dayNumber);
        r.setStopId(stopId);
        return r;
    }

    private String getPrimaryCityName(City city) {
        return city.getNames().stream()
                .filter(CityName::isPrimary)
                .findFirst()
                .map(CityName::getName)
                .orElse(city.getNames().isEmpty() ? null : city.getNames().getFirst().getName());
    }

    private User findUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private City findCityOrThrow(Long id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("City not found"));
    }

    private Place findPlaceOrThrow(Long id) {
        return placeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Place not found"));
    }

    private CircuitStop findStopOrThrow(Long id) {
        return circuitStopRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Circuit stop not found"));
    }

    private Circuit findOwnedCircuitOrThrow(Long circuitId, Long userId) {
        Circuit circuit = circuitRepository.findById(circuitId)
                .orElseThrow(() -> new NotFoundException("Circuit not found"));

        if (!circuit.getCreatedBy().getId().equals(userId)) {
            throw new NotFoundException("Circuit not found");
        }

        return circuit;
    }

    private String normalizeStopKind(String stopKind) {
        if (stopKind == null) return null;
        String v = stopKind.trim().toUpperCase();
        if (v.isBlank()) throw new BadRequestException("stopKind cannot be blank");

        if (!v.equals("VISIT") && !v.equals("EAT") && !v.equals("SLEEP") && !v.equals("TRANSPORT")) {
            throw new BadRequestException("Invalid stopKind");
        }
        return v;
    }

    private String normalizeMealType(String mealType) {
        if (mealType == null) return null;
        String v = mealType.trim().toUpperCase();
        if (v.isBlank()) throw new BadRequestException("mealType cannot be blank");

        if (!v.equals("BREAKFAST") && !v.equals("LUNCH") && !v.equals("DINNER")) {
            throw new BadRequestException("Invalid mealType");
        }
        return v;
    }

    private void validateStopSchedule(Integer dayNumber, String stopKind, String mealType, LocalTime startTime, LocalTime endTime) {
        if (dayNumber != null && dayNumber <= 0) {
            throw new BadRequestException("Day number must be > 0");
        }

        if ((startTime != null || endTime != null) && dayNumber == null) {
            throw new BadRequestException("dayNumber is required when specifying startTime/endTime");
        }

        if ((startTime == null) != (endTime == null)) {
            throw new BadRequestException("startTime and endTime must be provided together");
        }

        if (mealType != null && (stopKind == null || !stopKind.equals("EAT"))) {
            throw new BadRequestException("mealType requires stopKind EAT");
        }

        if (startTime != null && endTime != null && !startTime.isBefore(endTime)) {
            throw new BadRequestException("startTime must be before endTime");
        }
    }

    private void validateNoOverlappingTimeWindows(Long circuitId, Long stopIdToIgnore, Integer dayNumber, LocalTime startTime, LocalTime endTime) {
        if (dayNumber == null || startTime == null || endTime == null) return;

        List<CircuitStop> sameCircuitStops = circuitStopRepository.findByCircuitIdOrderByPositionAsc(circuitId);
        for (CircuitStop s : sameCircuitStops) {
            if (stopIdToIgnore != null && s.getId().equals(stopIdToIgnore)) continue;
            if (s.getDayNumber() == null || !s.getDayNumber().equals(dayNumber)) continue;
            if (s.getStartTime() == null || s.getEndTime() == null) continue;

            boolean overlaps = startTime.isBefore(s.getEndTime()) && s.getStartTime().isBefore(endTime);
            if (overlaps) {
                throw new BadRequestException("Time window overlaps with another stop on day " + dayNumber);
            }
        }
    }
}
