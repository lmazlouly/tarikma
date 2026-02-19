package com.tarikma.app.dto.circuit;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpsertCircuitRouteRequest {

    @NotNull(message = "From stop ID is required")
    private Long fromStopId;

    @NotNull(message = "To stop ID is required")
    private Long toStopId;

    @Size(max = 30)
    private String transportMode;

    private Long transportOptionId;

    private Double distanceKm;

    private Integer durationMinutes;

    public Long getFromStopId() {
        return fromStopId;
    }

    public void setFromStopId(Long fromStopId) {
        this.fromStopId = fromStopId;
    }

    public Long getToStopId() {
        return toStopId;
    }

    public void setToStopId(Long toStopId) {
        this.toStopId = toStopId;
    }

    public String getTransportMode() {
        return transportMode;
    }

    public void setTransportMode(String transportMode) {
        this.transportMode = transportMode;
    }

    public Long getTransportOptionId() {
        return transportOptionId;
    }

    public void setTransportOptionId(Long transportOptionId) {
        this.transportOptionId = transportOptionId;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}
