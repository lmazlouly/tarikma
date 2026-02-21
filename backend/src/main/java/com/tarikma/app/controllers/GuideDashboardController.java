package com.tarikma.app.controllers;

import com.tarikma.app.dto.guide.GuideBookingResponse;
import com.tarikma.app.dto.guide.GuideDashboardSummary;
import com.tarikma.app.service.GuideDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/guide")
public class GuideDashboardController {

    private final GuideDashboardService guideDashboardService;

    public GuideDashboardController(GuideDashboardService guideDashboardService) {
        this.guideDashboardService = guideDashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<GuideDashboardSummary> getSummary(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(guideDashboardService.getGuideSummary(jwt.getSubject()));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<GuideBookingResponse>> getBookings(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(guideDashboardService.getGuideBookings(jwt.getSubject()));
    }
}
