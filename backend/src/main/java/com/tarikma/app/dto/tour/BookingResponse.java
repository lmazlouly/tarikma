package com.tarikma.app.dto.tour;

import java.math.BigDecimal;
import java.time.Instant;

public class BookingResponse {

    private Long id;
    private Long circuitSessionId;
    private Long circuitId;
    private String tourName;
    private Instant sessionStartDateTime;
    private BigDecimal amountMad;
    private String status;
    private Instant createdAt;
    private Instant paidAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCircuitSessionId() { return circuitSessionId; }
    public void setCircuitSessionId(Long circuitSessionId) { this.circuitSessionId = circuitSessionId; }

    public Long getCircuitId() { return circuitId; }
    public void setCircuitId(Long circuitId) { this.circuitId = circuitId; }

    public String getTourName() { return tourName; }
    public void setTourName(String tourName) { this.tourName = tourName; }

    public Instant getSessionStartDateTime() { return sessionStartDateTime; }
    public void setSessionStartDateTime(Instant sessionStartDateTime) { this.sessionStartDateTime = sessionStartDateTime; }

    public BigDecimal getAmountMad() { return amountMad; }
    public void setAmountMad(BigDecimal amountMad) { this.amountMad = amountMad; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
}
