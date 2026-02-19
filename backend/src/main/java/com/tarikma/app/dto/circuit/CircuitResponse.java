package com.tarikma.app.dto.circuit;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class CircuitResponse {

    private Long id;
    private Long cityId;
    private String cityName;
    private String name;
    private String notes;
    private Instant createdAt;
    private Long createdBy;

    private List<CircuitStopResponse> stops = new ArrayList<>();
    private List<CircuitRouteResponse> routes = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCityId() {
        return cityId;
    }

    public void setCityId(Long cityId) {
        this.cityId = cityId;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public List<CircuitStopResponse> getStops() {
        return stops;
    }

    public void setStops(List<CircuitStopResponse> stops) {
        this.stops = stops;
    }

    public List<CircuitRouteResponse> getRoutes() {
        return routes;
    }

    public void setRoutes(List<CircuitRouteResponse> routes) {
        this.routes = routes;
    }
}
