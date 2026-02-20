package com.tarikma.app.dto.circuit;

import java.math.BigDecimal;
import java.time.Instant;

public class CircuitSummaryResponse {

    private Long id;
    private Long cityId;
    private String cityName;
    private String name;
    private String notes;
    private BigDecimal priceMad;
    private Instant createdAt;
    private long stopCount;

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

    public BigDecimal getPriceMad() {
        return priceMad;
    }

    public void setPriceMad(BigDecimal priceMad) {
        this.priceMad = priceMad;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public long getStopCount() {
        return stopCount;
    }

    public void setStopCount(long stopCount) {
        this.stopCount = stopCount;
    }
}
