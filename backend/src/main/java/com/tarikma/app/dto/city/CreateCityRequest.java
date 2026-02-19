package com.tarikma.app.dto.city;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateCityRequest {

    @NotBlank(message = "Region is required")
    @Size(max = 100)
    private String region;

    @Size(max = 500)
    private String image;

    private String description;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotEmpty(message = "At least one city name is required")
    @Valid
    private List<CityNameRequest> names;

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

    public List<CityNameRequest> getNames() { return names; }
    public void setNames(List<CityNameRequest> names) { this.names = names; }
}
