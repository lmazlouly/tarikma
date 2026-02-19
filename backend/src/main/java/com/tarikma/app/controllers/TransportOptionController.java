package com.tarikma.app.controllers;

import com.tarikma.app.dto.transport.CreateTransportOptionRequest;
import com.tarikma.app.dto.transport.TransportOptionResponse;
import com.tarikma.app.dto.transport.UpdateTransportOptionRequest;
import com.tarikma.app.service.TransportOptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport-options")
public class TransportOptionController {

    private final TransportOptionService transportOptionService;

    public TransportOptionController(TransportOptionService transportOptionService) {
        this.transportOptionService = transportOptionService;
    }

    @GetMapping
    public ResponseEntity<List<TransportOptionResponse>> list(
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) Long fromPlaceId,
            @RequestParam(required = false) Long toPlaceId
    ) {
        return ResponseEntity.ok(transportOptionService.list(cityId, fromPlaceId, toPlaceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransportOptionResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(transportOptionService.get(id));
    }

    @PostMapping
    public ResponseEntity<TransportOptionResponse> create(
            @Valid @RequestBody CreateTransportOptionRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(transportOptionService.create(request, jwt.getSubject()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransportOptionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTransportOptionRequest request
    ) {
        return ResponseEntity.ok(transportOptionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transportOptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
