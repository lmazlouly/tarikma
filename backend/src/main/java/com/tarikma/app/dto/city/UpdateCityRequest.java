package com.tarikma.app.dto.city;

import jakarta.validation.constraints.Size;

public class UpdateCityRequest {

    @Size(max = 100)
    private String region;

    @Size(max = 500)
    private String image;

    private String description;

    private Double latitude;

    private Double longitude;

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
}
