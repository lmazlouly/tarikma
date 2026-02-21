package com.tarikma.app.dto.tour;

import com.tarikma.app.dto.circuit.CircuitStopResponse;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class TourDetailResponse {

    private Long id;
    private String name;
    private String notes;
    private BigDecimal priceMad;
    private Long cityId;
    private String cityName;
    private String guideName;
    private List<CircuitStopResponse> stops = new ArrayList<>();
    private List<TourSessionResponse> sessions = new ArrayList<>();

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

    public String getGuideName() { return guideName; }
    public void setGuideName(String guideName) { this.guideName = guideName; }

    public List<CircuitStopResponse> getStops() { return stops; }
    public void setStops(List<CircuitStopResponse> stops) { this.stops = stops; }

    public List<TourSessionResponse> getSessions() { return sessions; }
    public void setSessions(List<TourSessionResponse> sessions) { this.sessions = sessions; }
}
