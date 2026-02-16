package com.tarikma.app.controllers;

import com.tarikma.app.dto.admin.*;
import com.tarikma.app.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ── Users ──────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> listUsers() {
        return ResponseEntity.ok(adminService.listUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUser(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{id}/toggle-enabled")
    public ResponseEntity<AdminUserResponse> toggleUserEnabled(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserEnabled(id));
    }

    @PostMapping("/users/{id}/roles")
    public ResponseEntity<AdminUserResponse> assignRole(
            @PathVariable Long id,
            @Valid @RequestBody AssignRoleRequest request
    ) {
        return ResponseEntity.ok(adminService.assignRole(id, request));
    }

    @DeleteMapping("/users/{userId}/roles/{roleName}")
    public ResponseEntity<AdminUserResponse> removeRole(
            @PathVariable Long userId,
            @PathVariable String roleName
    ) {
        return ResponseEntity.ok(adminService.removeRole(userId, roleName));
    }

    // ── Companies ──────────────────────────────────────────────

    @GetMapping("/companies")
    public ResponseEntity<List<AdminCompanyResponse>> listCompanies() {
        return ResponseEntity.ok(adminService.listCompanies());
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<AdminCompanyResponse> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getCompany(id));
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<AdminCompanyResponse> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCompanyRequest request
    ) {
        return ResponseEntity.ok(adminService.updateCompany(id, request));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        adminService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/companies/{id}/verify")
    public ResponseEntity<AdminCompanyResponse> verifyCompany(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.verifyCompany(id));
    }

    @PatchMapping("/companies/{id}/unverify")
    public ResponseEntity<AdminCompanyResponse> unverifyCompany(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.unverifyCompany(id));
    }

    // ── Company Members ────────────────────────────────────────

    @GetMapping("/companies/{companyId}/members")
    public ResponseEntity<List<AdminCompanyMemberResponse>> listCompanyMembers(
            @PathVariable Long companyId
    ) {
        return ResponseEntity.ok(adminService.listCompanyMembers(companyId));
    }

    @GetMapping("/company-members")
    public ResponseEntity<List<AdminCompanyMemberResponse>> listAllCompanyMembers() {
        return ResponseEntity.ok(adminService.listAllCompanyMembers());
    }

    @PostMapping("/companies/{companyId}/members")
    public ResponseEntity<AdminCompanyMemberResponse> addCompanyMember(
            @PathVariable Long companyId,
            @Valid @RequestBody AddCompanyMemberRequest request
    ) {
        return ResponseEntity.ok(adminService.addCompanyMember(companyId, request));
    }

    @DeleteMapping("/companies/{companyId}/members/{userId}")
    public ResponseEntity<Void> removeCompanyMember(
            @PathVariable Long companyId,
            @PathVariable Long userId
    ) {
        adminService.removeCompanyMember(companyId, userId);
        return ResponseEntity.noContent().build();
    }

    // ── Guides ─────────────────────────────────────────────────

    @GetMapping("/guides")
    public ResponseEntity<List<AdminGuideResponse>> listGuides() {
        return ResponseEntity.ok(adminService.listGuides());
    }

    @GetMapping("/guides/{userId}")
    public ResponseEntity<AdminGuideResponse> getGuide(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getGuide(userId));
    }

    @PatchMapping("/guides/{userId}/verify")
    public ResponseEntity<AdminGuideResponse> verifyGuide(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.verifyGuide(userId));
    }

    @PatchMapping("/guides/{userId}/reject")
    public ResponseEntity<AdminGuideResponse> rejectGuide(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.rejectGuide(userId));
    }

    @DeleteMapping("/guides/{userId}")
    public ResponseEntity<Void> deleteGuide(@PathVariable Long userId) {
        adminService.deleteGuide(userId);
        return ResponseEntity.noContent().build();
    }

    // ── Roles ──────────────────────────────────────────────────

    @GetMapping("/roles")
    public ResponseEntity<List<AdminRoleResponse>> listRoles() {
        return ResponseEntity.ok(adminService.listRoles());
    }

    @PostMapping("/roles")
    public ResponseEntity<AdminRoleResponse> createRole(
            @Valid @RequestBody CreateRoleRequest request
    ) {
        return ResponseEntity.ok(adminService.createRole(request));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        adminService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
