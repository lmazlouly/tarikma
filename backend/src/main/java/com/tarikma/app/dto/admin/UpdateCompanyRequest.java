package com.tarikma.app.dto.admin;

import jakarta.validation.constraints.Size;

public class UpdateCompanyRequest {

    @Size(min = 1, max = 200)
    private String name;

    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
