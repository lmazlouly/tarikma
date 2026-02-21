package com.tarikma.app.service;

import com.tarikma.app.dto.guide.GuideBookingResponse;
import com.tarikma.app.dto.guide.GuideDashboardSummary;
import com.tarikma.app.entity.Booking;
import com.tarikma.app.entity.Circuit;
import com.tarikma.app.entity.CircuitSession;
import com.tarikma.app.entity.User;
import com.tarikma.app.exception.NotFoundException;
import com.tarikma.app.repository.BookingRepository;
import com.tarikma.app.repository.CircuitRepository;
import com.tarikma.app.repository.CircuitSessionRepository;
import com.tarikma.app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class GuideDashboardService {

    private final BookingRepository bookingRepository;
    private final CircuitRepository circuitRepository;
    private final CircuitSessionRepository circuitSessionRepository;
    private final UserRepository userRepository;

    public GuideDashboardService(
            BookingRepository bookingRepository,
            CircuitRepository circuitRepository,
            CircuitSessionRepository circuitSessionRepository,
            UserRepository userRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.circuitRepository = circuitRepository;
        this.circuitSessionRepository = circuitSessionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<GuideBookingResponse> getGuideBookings(String guideEmail) {
        User guide = userRepository.findByEmail(guideEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        List<Booking> bookings = bookingRepository.findByCircuitCreatedByIdOrderByCreatedAtDesc(guide.getId());

        return bookings.stream()
                .map(this::toGuideBookingResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GuideDashboardSummary getGuideSummary(String guideEmail) {
        User guide = userRepository.findByEmail(guideEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        List<Booking> bookings = bookingRepository.findByCircuitCreatedByIdOrderByCreatedAtDesc(guide.getId());
        List<Circuit> circuits = circuitRepository.findByCreatedById(guide.getId());

        long totalBookings = bookings.size();
        long confirmed = bookings.stream().filter(b -> "CONFIRMED".equals(b.getStatus())).count();
        long pending = bookings.stream().filter(b -> "PENDING".equals(b.getStatus())).count();

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .map(Booking::getAmountMad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalTourists = bookings.stream()
                .map(b -> b.getUser().getId())
                .distinct()
                .count();

        long upcomingSessions = circuits.stream()
                .flatMap(c -> circuitSessionRepository.findByCircuitIdOrderByStartDateTimeAsc(c.getId()).stream())
                .filter(s -> "SCHEDULED".equals(s.getStatus()) && s.getStartDateTime().isAfter(Instant.now()))
                .count();

        GuideDashboardSummary summary = new GuideDashboardSummary();
        summary.setTotalBookings(totalBookings);
        summary.setConfirmedBookings(confirmed);
        summary.setPendingBookings(pending);
        summary.setTotalRevenue(totalRevenue);
        summary.setTotalTourists(totalTourists);
        summary.setTotalCircuits(circuits.size());
        summary.setUpcomingSessions(upcomingSessions);

        return summary;
    }

    private GuideBookingResponse toGuideBookingResponse(Booking b) {
        CircuitSession session = b.getCircuitSession();
        Circuit circuit = session.getCircuit();
        User tourist = b.getUser();

        GuideBookingResponse r = new GuideBookingResponse();
        r.setId(b.getId());
        r.setCircuitId(circuit.getId());
        r.setCircuitName(circuit.getName());
        r.setCircuitSessionId(session.getId());
        r.setSessionStartDateTime(session.getStartDateTime());
        r.setSessionEndDateTime(session.getEndDateTime());
        r.setSessionStatus(session.getStatus());

        r.setTouristId(tourist.getId());
        r.setTouristName(tourist.getFullName());
        r.setTouristEmail(tourist.getEmail());
        r.setTouristPhone(tourist.getPhone());

        r.setAmountMad(b.getAmountMad());
        r.setPaymentStatus(b.getStatus());
        r.setCreatedAt(b.getCreatedAt());
        r.setPaidAt(b.getPaidAt());

        return r;
    }
}
