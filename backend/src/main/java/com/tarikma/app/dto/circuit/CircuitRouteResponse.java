package com.tarikma.app.dto.circuit;

public class CircuitRouteResponse {

    private Long id;
    private Long fromStopId;
    private Long toStopId;
    private Long transportOptionId;
    private String transportMode;
    private Double distanceKm;
    private Integer durationMinutes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Long getTransportOptionId() {
        return transportOptionId;
    }

    public void setTransportOptionId(Long transportOptionId) {
        this.transportOptionId = transportOptionId;
    }

    public String getTransportMode() {
        return transportMode;
    }

    public void setTransportMode(String transportMode) {
        this.transportMode = transportMode;
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
