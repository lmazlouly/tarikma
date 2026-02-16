package com.tarikma.app.dto.admin;

public class AdminCompanyMemberResponse {

    private Long companyId;
    private String companyName;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String memberRole;
    private String status;

    public AdminCompanyMemberResponse() {
    }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getMemberRole() { return memberRole; }
    public void setMemberRole(String memberRole) { this.memberRole = memberRole; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
