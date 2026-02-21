package com.tarikma.app.dto.circuit;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class UpdateCircuitRequest {

    @Size(max = 200)
    private String name;

    private String notes;

    @DecimalMin(value = "0.00", message = "Price must be >= 0")
    private BigDecimal priceMad;

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

    public BigDecimal getPriceMad() {
        return priceMad;
    }

    public void setPriceMad(BigDecimal priceMad) {
        this.priceMad = priceMad;
    }
}
