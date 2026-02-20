package com.tarikma.app.controllers;

import com.tarikma.app.dto.tour.TourDetailResponse;
import com.tarikma.app.dto.tour.TourSummaryResponse;
import com.tarikma.app.service.TourService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    private final TourService tourService;

    public TourController(TourService tourService) {
        this.tourService = tourService;
    }

    @GetMapping
    public ResponseEntity<List<TourSummaryResponse>> listTours(
            @RequestParam(required = false) Long cityId
    ) {
        return ResponseEntity.ok(tourService.listTours(cityId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDetailResponse> getTourDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userEmail = jwt != null ? jwt.getSubject() : null;
        return ResponseEntity.ok(tourService.getTourDetail(id, userEmail));
    }
}
