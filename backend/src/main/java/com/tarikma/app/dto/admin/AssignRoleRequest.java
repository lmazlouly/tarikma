package com.tarikma.app.dto.admin;

import jakarta.validation.constraints.NotBlank;

public class AssignRoleRequest {

    @NotBlank
    private String roleName;

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}
