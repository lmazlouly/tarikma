package com.tarikma.app.controllers;

import com.tarikma.app.dto.city.CityResponse;
import com.tarikma.app.dto.city.CreatePlaceRequest;
import com.tarikma.app.dto.city.PlaceResponse;
import com.tarikma.app.service.CityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    private final CityService cityService;

    public CityController(CityService cityService) {
        this.cityService = cityService;
    }

    // ── Public endpoints ────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<CityResponse>> listCities() {
        return ResponseEntity.ok(cityService.listCities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CityResponse> getCity(@PathVariable Long id) {
        return ResponseEntity.ok(cityService.getCity(id));
    }

    @GetMapping("/{cityId}/places")
    public ResponseEntity<List<PlaceResponse>> listPlaces(@PathVariable Long cityId) {
        return ResponseEntity.ok(cityService.listPlaces(cityId));
    }

    @GetMapping("/places/{id}")
    public ResponseEntity<PlaceResponse> getPlace(@PathVariable Long id) {
        return ResponseEntity.ok(cityService.getPlace(id));
    }

    // ── Authenticated: create place (GUIDE, COMPANY_OWNER, COMPANY_STAFF) ──

    @PostMapping("/{cityId}/places")
    public ResponseEntity<PlaceResponse> createPlace(
            @PathVariable Long cityId,
            @Valid @RequestBody CreatePlaceRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        request.setCityId(cityId);
        return ResponseEntity.ok(cityService.createPlace(request, jwt.getSubject()));
    }
}
