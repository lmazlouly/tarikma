package com.tarikma.app.dto.transport;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public class CreateTransportOptionRequest {

    @NotNull(message = "From place ID is required")
    private Long fromPlaceId;

    @NotNull(message = "To place ID is required")
    private Long toPlaceId;

    @NotBlank(message = "Mode is required")
    @Size(max = 30)
    private String mode;

    @Size(max = 200)
    private String name;

    private String description;

    private boolean bidirectional;

    @NotBlank(message = "Pricing type is required")
    @Size(max = 20)
    private String pricingType;

    private Double priceMad;

    private Double pricePerKmMad;

    @Size(max = 3)
    private String currency;

    private LocalTime serviceStartTime;

    private LocalTime serviceEndTime;

    private Double distanceKm;

    private Integer durationMinutes;

    public Long getFromPlaceId() {
        return fromPlaceId;
    }

    public void setFromPlaceId(Long fromPlaceId) {
        this.fromPlaceId = fromPlaceId;
    }

    public Long getToPlaceId() {
        return toPlaceId;
    }

    public void setToPlaceId(Long toPlaceId) {
        this.toPlaceId = toPlaceId;
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
}
