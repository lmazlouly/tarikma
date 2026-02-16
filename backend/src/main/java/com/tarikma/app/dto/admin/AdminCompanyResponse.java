package com.tarikma.app.dto.admin;

import java.time.Instant;

public class AdminCompanyResponse {

    private Long id;
    private String name;
    private String description;
    private boolean verified;
    private Instant createdAt;
    private int memberCount;

    public AdminCompanyResponse() {
    }

    public AdminCompanyResponse(Long id, String name, String description,
                                boolean verified, Instant createdAt, int memberCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.verified = verified;
        this.createdAt = createdAt;
        this.memberCount = memberCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public int getMemberCount() { return memberCount; }
    public void setMemberCount(int memberCount) { this.memberCount = memberCount; }
}
