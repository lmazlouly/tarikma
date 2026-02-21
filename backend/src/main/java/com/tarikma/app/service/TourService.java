package com.tarikma.app.service;

import com.tarikma.app.dto.circuit.CircuitStopResponse;
import com.tarikma.app.dto.tour.TourDetailResponse;
import com.tarikma.app.dto.tour.TourSessionResponse;
import com.tarikma.app.dto.tour.TourSummaryResponse;
import com.tarikma.app.entity.Circuit;
import com.tarikma.app.entity.CircuitSession;
import com.tarikma.app.entity.CircuitStop;
import com.tarikma.app.entity.CityName;
import com.tarikma.app.entity.Place;
import com.tarikma.app.exception.NotFoundException;
import com.tarikma.app.entity.User;
import com.tarikma.app.repository.BookingRepository;
import com.tarikma.app.repository.CircuitRepository;
import com.tarikma.app.repository.CircuitSessionRepository;
import com.tarikma.app.repository.CircuitStopRepository;
import com.tarikma.app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
public class TourService {

    private final CircuitRepository circuitRepository;
    private final CircuitStopRepository circuitStopRepository;
    private final CircuitSessionRepository circuitSessionRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public TourService(
            CircuitRepository circuitRepository,
            CircuitStopRepository circuitStopRepository,
            CircuitSessionRepository circuitSessionRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository
    ) {
        this.circuitRepository = circuitRepository;
        this.circuitStopRepository = circuitStopRepository;
        this.circuitSessionRepository = circuitSessionRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TourSummaryResponse> listTours(Long cityId) {
        List<Circuit> circuits = cityId != null
                ? circuitRepository.findPublishedToursByCityId(cityId)
                : circuitRepository.findPublishedTours();

        Instant now = Instant.now();

        return circuits.stream()
                .map(c -> {
                    List<CircuitSession> upcoming = circuitSessionRepository
                            .findByCircuitIdOrderByStartDateTimeAsc(c.getId())
                            .stream()
                            .filter(s -> "SCHEDULED".equals(s.getStatus()) && s.getStartDateTime().isAfter(now))
                            .toList();

                    TourSummaryResponse r = new TourSummaryResponse();
                    r.setId(c.getId());
                    r.setName(c.getName());
                    r.setNotes(c.getNotes());
                    r.setPriceMad(c.getPriceMad());
                    r.setCityId(c.getCity().getId());
                    r.setCityName(getPrimaryCityName(c));
                    r.setStopCount(circuitStopRepository.countByCircuitId(c.getId()));
                    r.setGuideName(c.getCreatedBy().getFullName());
                    r.setUpcomingSessionCount(upcoming.size());
                    if (!upcoming.isEmpty()) {
                        r.setNextSessionAt(upcoming.getFirst().getStartDateTime());
                    }
                    return r;
                })
                .sorted(Comparator.comparing(
                        TourSummaryResponse::getNextSessionAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public TourDetailResponse getTourDetail(Long circuitId, String userEmail) {
        Circuit circuit = circuitRepository.findById(circuitId)
                .orElseThrow(() -> new NotFoundException("Tour not found"));

        if (circuit.getPriceMad() == null) {
            throw new NotFoundException("Tour not found");
        }

        Instant now = Instant.now();

        List<CircuitStop> stops = circuitStopRepository.findByCircuitIdOrderByPositionAsc(circuitId);
        List<CircuitSession> sessions = circuitSessionRepository
                .findByCircuitIdOrderByStartDateTimeAsc(circuitId)
                .stream()
                .filter(s -> "SCHEDULED".equals(s.getStatus()) && s.getStartDateTime().isAfter(now))
                .toList();

        TourDetailResponse r = new TourDetailResponse();
        r.setId(circuit.getId());
        r.setName(circuit.getName());
        r.setNotes(circuit.getNotes());
        r.setPriceMad(circuit.getPriceMad());
        r.setCityId(circuit.getCity().getId());
        r.setCityName(getPrimaryCityName(circuit));
        r.setGuideName(circuit.getCreatedBy().getFullName());
        Long userId = null;
        if (userEmail != null) {
            userId = userRepository.findByEmail(userEmail).map(User::getId).orElse(null);
        }
        final Long resolvedUserId = userId;

        r.setStops(stops.stream().map(this::toStopResponse).toList());
        r.setSessions(sessions.stream().map(s -> toTourSessionResponse(s, resolvedUserId)).toList());

        return r;
    }

    private TourSessionResponse toTourSessionResponse(CircuitSession s, Long userId) {
        long booked = bookingRepository.countByCircuitSessionIdAndStatus(s.getId(), "CONFIRMED");
        int maxP = s.getMaxParticipants() != null ? s.getMaxParticipants() : Integer.MAX_VALUE;
        int available = Math.max(0, maxP - (int) booked);

        TourSessionResponse r = new TourSessionResponse();
        r.setId(s.getId());
        r.setStartDateTime(s.getStartDateTime());
        r.setEndDateTime(s.getEndDateTime());
        r.setMaxParticipants(s.getMaxParticipants());
        r.setBookedCount(booked);
        r.setAvailablePlaces(available);
        r.setStatus(s.getStatus());
        r.setUserBooked(userId != null && bookingRepository.existsByCircuitSessionIdAndUserId(s.getId(), userId));
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

    private String getPrimaryCityName(Circuit c) {
        return c.getCity().getNames().stream()
                .filter(CityName::isPrimary)
                .findFirst()
                .map(CityName::getName)
                .orElse(c.getCity().getNames().isEmpty() ? null : c.getCity().getNames().getFirst().getName());
    }
}
