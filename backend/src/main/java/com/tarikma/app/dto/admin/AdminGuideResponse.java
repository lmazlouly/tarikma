package com.tarikma.app.dto.admin;

public class AdminGuideResponse {

    private Long userId;
    private String fullName;
    private String email;
    private String guideType;
    private String verificationStatus;
    private String bio;
    private String languages;
    private Long companyId;
    private String companyName;

    public AdminGuideResponse() {
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getGuideType() { return guideType; }
    public void setGuideType(String guideType) { this.guideType = guideType; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
}
