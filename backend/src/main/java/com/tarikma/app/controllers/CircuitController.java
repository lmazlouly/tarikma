package com.tarikma.app.controllers;

import com.tarikma.app.dto.circuit.*;
import com.tarikma.app.service.CircuitService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/circuits")
public class CircuitController {

    private final CircuitService circuitService;

    public CircuitController(CircuitService circuitService) {
        this.circuitService = circuitService;
    }

    @GetMapping
    public ResponseEntity<List<CircuitSummaryResponse>> listMyCircuits(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Long cityId
    ) {
        return ResponseEntity.ok(circuitService.listMyCircuits(jwt.getSubject(), cityId));
    }

    @PostMapping
    public ResponseEntity<CircuitResponse> createCircuit(
            @Valid @RequestBody CreateCircuitRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.createCircuit(request, jwt.getSubject()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CircuitResponse> getMyCircuit(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.getMyCircuit(id, jwt.getSubject()));
    }

    @GetMapping("/{id}/planning-warnings")
    public ResponseEntity<List<CircuitPlanningWarningResponse>> getMyCircuitPlanningWarnings(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.getMyCircuitPlanningWarnings(id, jwt.getSubject()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CircuitResponse> updateCircuit(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCircuitRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.updateCircuit(id, request, jwt.getSubject()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCircuit(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        circuitService.deleteCircuit(id, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/stops")
    public ResponseEntity<CircuitResponse> addStop(
            @PathVariable Long id,
            @Valid @RequestBody AddCircuitStopRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.addStop(id, request, jwt.getSubject()));
    }

    @PutMapping("/{id}/stops/{stopId}")
    public ResponseEntity<CircuitResponse> updateStop(
            @PathVariable Long id,
            @PathVariable Long stopId,
            @Valid @RequestBody UpdateCircuitStopRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.updateStop(id, stopId, request, jwt.getSubject()));
    }

    @DeleteMapping("/{id}/stops/{stopId}")
    public ResponseEntity<CircuitResponse> deleteStop(
            @PathVariable Long id,
            @PathVariable Long stopId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.deleteStop(id, stopId, jwt.getSubject()));
    }

    @PutMapping("/{id}/routes")
    public ResponseEntity<CircuitResponse> upsertRoute(
            @PathVariable Long id,
            @Valid @RequestBody UpsertCircuitRouteRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.upsertRoute(id, request, jwt.getSubject()));
    }

    @PostMapping("/ai-generate")
    public ResponseEntity<CircuitResponse> aiGenerateCircuit(
            @Valid @RequestBody AiGenerateCircuitRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.generateCircuitWithAi(request, jwt.getSubject()));
    }

    @PostMapping("/{id}/ai-reorder")
    public ResponseEntity<CircuitResponse> aiReorderStops(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(circuitService.reorderStopsWithAi(id, jwt.getSubject()));
    }
}
