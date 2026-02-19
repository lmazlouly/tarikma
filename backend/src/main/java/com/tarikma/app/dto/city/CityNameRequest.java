package com.tarikma.app.dto.city;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CityNameRequest {

    @NotBlank(message = "Language code is required")
    @Pattern(regexp = "^(en|fr|ar|amz)$", message = "Language code must be one of: en, fr, ar, amz")
    private String languageCode;

    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    private boolean primary = false;

    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isPrimary() { return primary; }
    public void setPrimary(boolean primary) { this.primary = primary; }
}
