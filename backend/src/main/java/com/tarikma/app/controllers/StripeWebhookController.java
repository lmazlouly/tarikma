package com.tarikma.app.controllers;

import com.tarikma.app.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
public class StripeWebhookController {

    private final BookingService bookingService;

    public StripeWebhookController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        bookingService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("ok");
    }
}
