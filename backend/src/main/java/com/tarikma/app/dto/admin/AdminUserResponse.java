package com.tarikma.app.dto.admin;

import java.time.Instant;
import java.util.List;

public class AdminUserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private boolean verified;
    private boolean enabled;
    private Instant createdAt;
    private List<String> roles;

    public AdminUserResponse() {
    }

    public AdminUserResponse(Long id, String fullName, String email, String phone,
                             boolean verified, Instant createdAt, List<String> roles) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.verified = verified;
        this.createdAt = createdAt;
        this.roles = roles;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
