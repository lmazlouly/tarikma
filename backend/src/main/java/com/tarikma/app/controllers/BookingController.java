package com.tarikma.app.controllers;

import com.tarikma.app.dto.tour.BookingResponse;
import com.tarikma.app.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckout(
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long sessionId = body.get("sessionId");
        if (sessionId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "sessionId is required"));
        }
        String url = bookingService.createCheckoutSession(sessionId, jwt.getSubject());
        return ResponseEntity.ok(Map.of("checkoutUrl", url));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(bookingService.getMyBookings(jwt.getSubject()));
    }

    @GetMapping("/by-checkout")
    public ResponseEntity<BookingResponse> getByCheckoutId(
            @RequestParam String checkoutId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(bookingService.verifyAndGetBooking(checkoutId, jwt.getSubject()));
    }
}
