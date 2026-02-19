package com.tarikma.app.entity;

import java.io.Serializable;
import java.util.Objects;

public class CompanyMemberId implements Serializable {

    private Long companyId;
    private Long userId;

    public CompanyMemberId() {
    }

    public CompanyMemberId(Long companyId, Long userId) {
        this.companyId = companyId;
        this.userId = userId;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public Long getUserId() {
        return userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CompanyMemberId that)) return false;
        return Objects.equals(companyId, that.companyId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(companyId, userId);
    }
}
