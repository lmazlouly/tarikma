package com.tarikma.app.dto.circuit;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public class AddCircuitStopRequest {

    @NotNull(message = "Place ID is required")
    private Long placeId;

    private Integer position;

    @Min(value = 1, message = "Day number must be > 0")
    private Integer dayNumber;

    @Size(max = 20)
    private String stopKind;

    @Size(max = 20)
    private String mealType;

    private LocalTime startTime;

    private LocalTime endTime;

    @Min(value = 0, message = "Duration minutes must be >= 0")
    private Integer durationMinutes;

    private String notes;

    public Long getPlaceId() {
        return placeId;
    }

    public void setPlaceId(Long placeId) {
        this.placeId = placeId;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Integer getDayNumber() {
        return dayNumber;
    }

    public void setDayNumber(Integer dayNumber) {
        this.dayNumber = dayNumber;
    }

    public String getStopKind() {
        return stopKind;
    }

    public void setStopKind(String stopKind) {
        this.stopKind = stopKind;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
