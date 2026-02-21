package com.tarikma.app.dto.tour;

import java.math.BigDecimal;
import java.time.Instant;

public class TourSummaryResponse {

    private Long id;
    private String name;
    private String notes;
    private BigDecimal priceMad;
    private Long cityId;
    private String cityName;
    private long stopCount;
    private String guideName;
    private Instant nextSessionAt;
    private int upcomingSessionCount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public BigDecimal getPriceMad() { return priceMad; }
    public void setPriceMad(BigDecimal priceMad) { this.priceMad = priceMad; }

    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public long getStopCount() { return stopCount; }
    public void setStopCount(long stopCount) { this.stopCount = stopCount; }

    public String getGuideName() { return guideName; }
    public void setGuideName(String guideName) { this.guideName = guideName; }

    public Instant getNextSessionAt() { return nextSessionAt; }
    public void setNextSessionAt(Instant nextSessionAt) { this.nextSessionAt = nextSessionAt; }

    public int getUpcomingSessionCount() { return upcomingSessionCount; }
    public void setUpcomingSessionCount(int upcomingSessionCount) { this.upcomingSessionCount = upcomingSessionCount; }
}
