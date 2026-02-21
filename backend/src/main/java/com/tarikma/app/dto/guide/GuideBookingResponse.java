package com.tarikma.app.dto.guide;

import java.math.BigDecimal;
import java.time.Instant;

public class GuideBookingResponse {

    private Long id;
    private Long circuitId;
    private String circuitName;
    private Long circuitSessionId;
    private Instant sessionStartDateTime;
    private Instant sessionEndDateTime;
    private String sessionStatus;

    // Tourist info
    private Long touristId;
    private String touristName;
    private String touristEmail;
    private String touristPhone;

    // Payment info
    private BigDecimal amountMad;
    private String paymentStatus;
    private Instant createdAt;
    private Instant paidAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCircuitId() { return circuitId; }
    public void setCircuitId(Long circuitId) { this.circuitId = circuitId; }

    public String getCircuitName() { return circuitName; }
    public void setCircuitName(String circuitName) { this.circuitName = circuitName; }

    public Long getCircuitSessionId() { return circuitSessionId; }
    public void setCircuitSessionId(Long circuitSessionId) { this.circuitSessionId = circuitSessionId; }

    public Instant getSessionStartDateTime() { return sessionStartDateTime; }
    public void setSessionStartDateTime(Instant sessionStartDateTime) { this.sessionStartDateTime = sessionStartDateTime; }

    public Instant getSessionEndDateTime() { return sessionEndDateTime; }
    public void setSessionEndDateTime(Instant sessionEndDateTime) { this.sessionEndDateTime = sessionEndDateTime; }

    public String getSessionStatus() { return sessionStatus; }
    public void setSessionStatus(String sessionStatus) { this.sessionStatus = sessionStatus; }

    public Long getTouristId() { return touristId; }
    public void setTouristId(Long touristId) { this.touristId = touristId; }

    public String getTouristName() { return touristName; }
    public void setTouristName(String touristName) { this.touristName = touristName; }

    public String getTouristEmail() { return touristEmail; }
    public void setTouristEmail(String touristEmail) { this.touristEmail = touristEmail; }

    public String getTouristPhone() { return touristPhone; }
    public void setTouristPhone(String touristPhone) { this.touristPhone = touristPhone; }

    public BigDecimal getAmountMad() { return amountMad; }
    public void setAmountMad(BigDecimal amountMad) { this.amountMad = amountMad; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
}
