package com.tarikma.app.dto.admin;

public class AdminRoleResponse {

    private Long id;
    private String name;
    private int userCount;

    public AdminRoleResponse() {
    }

    public AdminRoleResponse(Long id, String name, int userCount) {
        this.id = id;
        this.name = name;
        this.userCount = userCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getUserCount() { return userCount; }
    public void setUserCount(int userCount) { this.userCount = userCount; }
}
