package com.tarikma.app.dto.city;

import java.time.Instant;
import java.util.List;

public class CityResponse {

    private Long id;
    private String region;
    private String image;
    private String description;
    private Double latitude;
    private Double longitude;
    private Instant createdAt;
    private Long createdBy;
    private List<CityNameResponse> names;
    private int placeCount;

    public CityResponse() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public List<CityNameResponse> getNames() { return names; }
    public void setNames(List<CityNameResponse> names) { this.names = names; }

    public int getPlaceCount() { return placeCount; }
    public void setPlaceCount(int placeCount) { this.placeCount = placeCount; }
}
