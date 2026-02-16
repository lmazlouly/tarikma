package com.tarikma.app.controllers;

import com.tarikma.app.dto.city.*;
import com.tarikma.app.service.CityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cities")
public class AdminCityController {

    private final CityService cityService;

    public AdminCityController(CityService cityService) {
        this.cityService = cityService;
    }

    // ── Cities ──────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<CityResponse>> listCities() {
        return ResponseEntity.ok(cityService.listCities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CityResponse> getCity(@PathVariable Long id) {
        return ResponseEntity.ok(cityService.getCity(id));
    }

    @PostMapping
    public ResponseEntity<CityResponse> createCity(
            @Valid @RequestBody CreateCityRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(cityService.createCity(request, jwt.getSubject()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CityResponse> updateCity(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCityRequest request
    ) {
        return ResponseEntity.ok(cityService.updateCity(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCity(@PathVariable Long id) {
        cityService.deleteCity(id);
        return ResponseEntity.noContent().build();
    }

    // ── City Names ──────────────────────────────────────────────

    @PostMapping("/{cityId}/names")
    public ResponseEntity<CityNameResponse> addCityName(
            @PathVariable Long cityId,
            @Valid @RequestBody CityNameRequest request
    ) {
        return ResponseEntity.ok(cityService.addCityName(cityId, request));
    }

    @PutMapping("/{cityId}/names/{nameId}")
    public ResponseEntity<CityNameResponse> updateCityName(
            @PathVariable Long cityId,
            @PathVariable Long nameId,
            @Valid @RequestBody CityNameRequest request
    ) {
        return ResponseEntity.ok(cityService.updateCityName(cityId, nameId, request));
    }

    @DeleteMapping("/{cityId}/names/{nameId}")
    public ResponseEntity<Void> deleteCityName(
            @PathVariable Long cityId,
            @PathVariable Long nameId
    ) {
        cityService.deleteCityName(cityId, nameId);
        return ResponseEntity.noContent().build();
    }

    // ── Places (admin) ──────────────────────────────────────────

    @GetMapping("/{cityId}/places")
    public ResponseEntity<List<PlaceResponse>> listPlaces(@PathVariable Long cityId) {
        return ResponseEntity.ok(cityService.listPlaces(cityId));
    }

    @PostMapping("/{cityId}/places")
    public ResponseEntity<PlaceResponse> createPlace(
            @PathVariable Long cityId,
            @Valid @RequestBody CreatePlaceRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        request.setCityId(cityId);
        return ResponseEntity.ok(cityService.createPlace(request, jwt.getSubject()));
    }

    @GetMapping("/places")
    public ResponseEntity<List<PlaceResponse>> listAllPlaces() {
        return ResponseEntity.ok(cityService.listAllPlaces());
    }

    @GetMapping("/places/{id}")
    public ResponseEntity<PlaceResponse> getPlace(@PathVariable Long id) {
        return ResponseEntity.ok(cityService.getPlace(id));
    }

    @PutMapping("/places/{id}")
    public ResponseEntity<PlaceResponse> updatePlace(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePlaceRequest request
    ) {
        return ResponseEntity.ok(cityService.updatePlace(id, request));
    }

    @DeleteMapping("/places/{id}")
    public ResponseEntity<Void> deletePlace(@PathVariable Long id) {
        cityService.deletePlace(id);
        return ResponseEntity.noContent().build();
    }
}
