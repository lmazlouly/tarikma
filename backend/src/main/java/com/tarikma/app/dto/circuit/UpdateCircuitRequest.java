package com.tarikma.app.dto.circuit;

import jakarta.validation.constraints.Size;

public class UpdateCircuitRequest {

    @Size(max = 200)
    private String name;

    private String notes;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
