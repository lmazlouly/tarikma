package com.tarikma.app.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.tarikma.app.dto.tour.BookingResponse;
import com.tarikma.app.entity.Booking;
import com.tarikma.app.entity.CircuitSession;
import com.tarikma.app.entity.User;
import com.tarikma.app.exception.BadRequestException;
import com.tarikma.app.exception.NotFoundException;
import com.tarikma.app.repository.BookingRepository;
import com.tarikma.app.repository.CircuitSessionRepository;
import com.tarikma.app.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final CircuitSessionRepository circuitSessionRepository;
    private final UserRepository userRepository;

    @Value("${app.stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${app.stripe.webhook-secret:}")
    private String stripeWebhookSecret;

    @Value("${app.stripe.success-url:}")
    private String successUrl;

    @Value("${app.stripe.cancel-url:}")
    private String cancelUrl;

    public BookingService(
            BookingRepository bookingRepository,
            CircuitSessionRepository circuitSessionRepository,
            UserRepository userRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.circuitSessionRepository = circuitSessionRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        if (stripeSecretKey != null && !stripeSecretKey.isBlank()) {
            Stripe.apiKey = stripeSecretKey;
            log.info("Stripe API key configured");
        } else {
            log.warn("Stripe API key is NOT configured — payments will fail");
        }
    }

    public boolean isConfigured() {
        return stripeSecretKey != null && !stripeSecretKey.isBlank();
    }

    @Transactional
    public String createCheckoutSession(Long circuitSessionId, String userEmail) {
        if (!isConfigured()) {
            throw new BadRequestException("Payment service is not configured");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean isGuide = user.getRoles().stream()
                .anyMatch(r -> "GUIDE".equals(r.getName()));
        if (isGuide) {
            throw new BadRequestException("Guides cannot book tours");
        }

        CircuitSession session = circuitSessionRepository.findById(circuitSessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));

        if (!"SCHEDULED".equals(session.getStatus())) {
            throw new BadRequestException("This session is no longer available for booking");
        }

        if (session.getStartDateTime().isBefore(Instant.now())) {
            throw new BadRequestException("This session has already started");
        }

        BigDecimal price = session.getCircuit().getPriceMad();
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("This tour does not have a valid price");
        }

        if (bookingRepository.existsByCircuitSessionIdAndUserId(circuitSessionId, user.getId())) {
            throw new BadRequestException("You have already booked this session");
        }

        if (session.getMaxParticipants() != null) {
            long confirmed = bookingRepository.countByCircuitSessionIdAndStatus(circuitSessionId, "CONFIRMED");
            if (confirmed >= session.getMaxParticipants()) {
                throw new BadRequestException("This session is fully booked");
            }
        }

        // Create booking record
        Booking booking = new Booking();
        booking.setCircuitSession(session);
        booking.setUser(user);
        booking.setAmountMad(price);
        booking.setStatus("PENDING");

        // Create Stripe checkout session
        try {
            long amountCentimes = price.multiply(BigDecimal.valueOf(100)).longValue();

            String tourName = session.getCircuit().getName();
            String resolvedCancelUrl = cancelUrl.replace("{tourId}", String.valueOf(session.getCircuit().getId()));

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(resolvedCancelUrl)
                    .setCustomerEmail(user.getEmail())
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("mad")
                                                    .setUnitAmount(amountCentimes)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(tourName)
                                                                    .setDescription("Tour booking: " + tourName)
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .putMetadata("booking_session_id", String.valueOf(circuitSessionId))
                    .putMetadata("user_id", String.valueOf(user.getId()))
                    .build();

            Session checkoutSession = Session.create(params);

            booking.setStripeCheckoutId(checkoutSession.getId());
            bookingRepository.save(booking);

            return checkoutSession.getUrl();

        } catch (StripeException e) {
            log.error("Stripe checkout creation failed", e);
            throw new BadRequestException("Payment service error: " + e.getMessage());
        }
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        if (stripeWebhookSecret == null || stripeWebhookSecret.isBlank()) {
            log.warn("Stripe webhook secret not configured, skipping verification");
            return;
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Stripe webhook signature verification failed", e);
            throw new BadRequestException("Invalid webhook signature");
        } catch (Exception e) {
            log.error("Stripe webhook parsing failed", e);
            throw new BadRequestException("Invalid webhook payload");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session stripeSession = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElse(null);

            if (stripeSession == null) {
                log.warn("Could not deserialize checkout session from webhook");
                return;
            }

            String checkoutId = stripeSession.getId();
            bookingRepository.findByStripeCheckoutId(checkoutId).ifPresent(booking -> {
                booking.setStatus("CONFIRMED");
                booking.setStripePaymentId(stripeSession.getPaymentIntent());
                booking.setPaidAt(Instant.now());
                bookingRepository.save(booking);
                log.info("Booking {} confirmed via Stripe webhook", booking.getId());
            });
        }
    }

    @Transactional
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        // Auto-verify any PENDING bookings by checking Stripe
        if (isConfigured()) {
            for (Booking b : bookings) {
                if ("PENDING".equals(b.getStatus()) && b.getStripeCheckoutId() != null) {
                    try {
                        Session stripeSession = Session.retrieve(b.getStripeCheckoutId());
                        if ("complete".equals(stripeSession.getStatus())
                                && "paid".equals(stripeSession.getPaymentStatus())) {
                            b.setStatus("CONFIRMED");
                            b.setStripePaymentId(stripeSession.getPaymentIntent());
                            b.setPaidAt(Instant.now());
                            bookingRepository.save(b);
                            log.info("Booking {} confirmed via direct Stripe verification (my-bookings)", b.getId());
                        }
                    } catch (StripeException e) {
                        log.warn("Could not verify Stripe session {}: {}", b.getStripeCheckoutId(), e.getMessage());
                    }
                }
            }
        }

        return bookings.stream()
                .map(this::toBookingResponse)
                .toList();
    }

    @Transactional
    public BookingResponse verifyAndGetBooking(String checkoutId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Booking booking = bookingRepository.findByStripeCheckoutId(checkoutId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new NotFoundException("Booking not found");
        }

        // If still PENDING, check Stripe directly to confirm payment
        if ("PENDING".equals(booking.getStatus()) && isConfigured()) {
            try {
                Session stripeSession = Session.retrieve(checkoutId);
                if ("complete".equals(stripeSession.getStatus())
                        && "paid".equals(stripeSession.getPaymentStatus())) {
                    booking.setStatus("CONFIRMED");
                    booking.setStripePaymentId(stripeSession.getPaymentIntent());
                    booking.setPaidAt(Instant.now());
                    bookingRepository.save(booking);
                    log.info("Booking {} confirmed via direct Stripe verification", booking.getId());
                }
            } catch (StripeException e) {
                log.warn("Could not verify Stripe session {}: {}", checkoutId, e.getMessage());
            }
        }

        return toBookingResponse(booking);
    }

    private BookingResponse toBookingResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setCircuitSessionId(b.getCircuitSession().getId());
        r.setCircuitId(b.getCircuitSession().getCircuit().getId());
        r.setTourName(b.getCircuitSession().getCircuit().getName());
        r.setSessionStartDateTime(b.getCircuitSession().getStartDateTime());
        r.setAmountMad(b.getAmountMad());
        r.setStatus(b.getStatus());
        r.setCreatedAt(b.getCreatedAt());
        r.setPaidAt(b.getPaidAt());
        return r;
    }
}
