package com.tarikma.app.dto.city;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreatePlaceRequest {

    @NotNull(message = "City ID is required")
    private Long cityId;

    @NotBlank(message = "Name is required")
    @Size(max = 300)
    private String name;

    private String description;

    @Size(max = 500)
    private String image;

    @Size(max = 500)
    private String address;

    @Size(max = 100)
    private String category;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @Size(max = 255)
    private String mapPlaceId;

    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getMapPlaceId() { return mapPlaceId; }
    public void setMapPlaceId(String mapPlaceId) { this.mapPlaceId = mapPlaceId; }
}
