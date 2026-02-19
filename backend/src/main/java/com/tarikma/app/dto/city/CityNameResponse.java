package com.tarikma.app.dto.city;

public class CityNameResponse {

    private Long id;
    private String languageCode;
    private String name;
    private boolean primary;

    public CityNameResponse() {
    }

    public CityNameResponse(Long id, String languageCode, String name, boolean primary) {
        this.id = id;
        this.languageCode = languageCode;
        this.name = name;
        this.primary = primary;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isPrimary() { return primary; }
    public void setPrimary(boolean primary) { this.primary = primary; }
}
