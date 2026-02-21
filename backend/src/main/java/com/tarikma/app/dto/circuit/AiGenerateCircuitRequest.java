package com.tarikma.app.dto.circuit;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class AiGenerateCircuitRequest {

    @NotNull(message = "City ID is required")
    private Long cityId;

    @NotNull(message = "Number of days is required")
    @Min(value = 1, message = "Must be at least 1 day")
    @Max(value = 7, message = "Maximum 7 days")
    private Integer numberOfDays;

    private List<String> interests;

    private String travelDate;

    public Long getCityId() {
        return cityId;
    }

    public void setCityId(Long cityId) {
        this.cityId = cityId;
    }

    public Integer getNumberOfDays() {
        return numberOfDays;
    }

    public void setNumberOfDays(Integer numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public String getTravelDate() {
        return travelDate;
    }

    public void setTravelDate(String travelDate) {
        this.travelDate = travelDate;
    }
}
