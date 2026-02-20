package com.tarikma.app.dto.circuit;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class AiSuggestPlacesRequest {

    @Min(value = 1, message = "Must suggest at least 1 place")
    @Max(value = 10, message = "Maximum 10 places")
    private Integer count = 5;

    private String preferences;

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public String getPreferences() {
        return preferences;
    }

    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }
}
