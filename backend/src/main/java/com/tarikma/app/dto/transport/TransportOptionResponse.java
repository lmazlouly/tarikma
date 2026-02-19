package com.tarikma.app.dto.transport;

import java.time.Instant;
import java.time.LocalTime;

public class TransportOptionResponse {

    private Long id;

    private Long fromPlaceId;
    private String fromPlaceName;

    private Long toPlaceId;
    private String toPlaceName;

    private String mode;
    private String name;
    private String description;
    private boolean bidirectional;

    private String pricingType;
    private Double priceMad;
    private Double pricePerKmMad;
    private String currency;

    private LocalTime serviceStartTime;
    private LocalTime serviceEndTime;

    private Double distanceKm;
    private Integer durationMinutes;

    private Instant createdAt;
    private Long createdBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFromPlaceId() {
        return fromPlaceId;
    }

    public void setFromPlaceId(Long fromPlaceId) {
        this.fromPlaceId = fromPlaceId;
    }

    public String getFromPlaceName() {
        return fromPlaceName;
    }

    public void setFromPlaceName(String fromPlaceName) {
        this.fromPlaceName = fromPlaceName;
    }

    public Long getToPlaceId() {
        return toPlaceId;
    }

    public void setToPlaceId(Long toPlaceId) {
        this.toPlaceId = toPlaceId;
    }

    public String getToPlaceName() {
        return toPlaceName;
    }

    public void setToPlaceName(String toPlaceName) {
        this.toPlaceName = toPlaceName;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isBidirectional() {
        return bidirectional;
    }

    public void setBidirectional(boolean bidirectional) {
        this.bidirectional = bidirectional;
    }

    public String getPricingType() {
        return pricingType;
    }

    public void setPricingType(String pricingType) {
        this.pricingType = pricingType;
    }

    public Double getPriceMad() {
        return priceMad;
    }

    public void setPriceMad(Double priceMad) {
        this.priceMad = priceMad;
    }

    public Double getPricePerKmMad() {
        return pricePerKmMad;
    }

    public void setPricePerKmMad(Double pricePerKmMad) {
        this.pricePerKmMad = pricePerKmMad;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalTime getServiceStartTime() {
        return serviceStartTime;
    }

    public void setServiceStartTime(LocalTime serviceStartTime) {
        this.serviceStartTime = serviceStartTime;
    }

    public LocalTime getServiceEndTime() {
        return serviceEndTime;
    }

    public void setServiceEndTime(LocalTime serviceEndTime) {
        this.serviceEndTime = serviceEndTime;
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
}
