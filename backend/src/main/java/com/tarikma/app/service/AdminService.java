package com.tarikma.app.service;

import com.tarikma.app.dto.admin.*;
import com.tarikma.app.entity.*;
import com.tarikma.app.exception.BadRequestException;
import com.tarikma.app.exception.NotFoundException;
import com.tarikma.app.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMemberRepository companyMemberRepository;
    private final GuideRepository guideRepository;

    public AdminService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            CompanyRepository companyRepository,
            CompanyMemberRepository companyMemberRepository,
            GuideRepository guideRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.companyRepository = companyRepository;
        this.companyMemberRepository = companyMemberRepository;
        this.guideRepository = guideRepository;
    }

    // ── Users ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toUserResponse).toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(Long id) {
        return toUserResponse(findUserOrThrow(id));
    }

    @Transactional
    public AdminUserResponse updateUser(Long id, UpdateUserRequest req) {
        User user = findUserOrThrow(id);
        if (req.getFullName() != null) user.setFullName(req.getFullName().trim());
        if (req.getEmail() != null) {
            String email = req.getEmail().trim().toLowerCase();
            if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(email);
        }
        if (req.getPhone() != null) user.setPhone(req.getPhone().trim());
        if (req.getVerified() != null) user.setVerified(req.getVerified());
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new NotFoundException("User not found");
        userRepository.deleteById(id);
    }

    @Transactional
    public AdminUserResponse toggleUserEnabled(Long id) {
        User user = findUserOrThrow(id);
        user.setEnabled(!user.isEnabled());
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse assignRole(Long userId, AssignRoleRequest req) {
        User user = findUserOrThrow(userId);
        String roleName = req.getRoleName().trim().toUpperCase();
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new NotFoundException("Role '" + roleName + "' not found"));
        user.getRoles().add(role);
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse removeRole(Long userId, String roleName) {
        User user = findUserOrThrow(userId);
        String normalized = roleName.trim().toUpperCase();
        user.getRoles().removeIf(r -> r.getName().equalsIgnoreCase(normalized));
        return toUserResponse(userRepository.save(user));
    }

    // ── Companies ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminCompanyResponse> listCompanies() {
        return companyRepository.findAll().stream().map(this::toCompanyResponse).toList();
    }

    @Transactional(readOnly = true)
    public AdminCompanyResponse getCompany(Long id) {
        return toCompanyResponse(findCompanyOrThrow(id));
    }

    @Transactional
    public AdminCompanyResponse updateCompany(Long id, UpdateCompanyRequest req) {
        Company company = findCompanyOrThrow(id);
        if (req.getName() != null) company.setName(req.getName().trim());
        if (req.getDescription() != null) company.setDescription(req.getDescription());
        return toCompanyResponse(companyRepository.save(company));
    }

    @Transactional
    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) throw new NotFoundException("Company not found");
        companyRepository.deleteById(id);
    }

    @Transactional
    public AdminCompanyResponse verifyCompany(Long id) {
        Company company = findCompanyOrThrow(id);
        company.setVerified(true);
        return toCompanyResponse(companyRepository.save(company));
    }

    @Transactional
    public AdminCompanyResponse unverifyCompany(Long id) {
        Company company = findCompanyOrThrow(id);
        company.setVerified(false);
        return toCompanyResponse(companyRepository.save(company));
    }

    // ── Company Members ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminCompanyMemberResponse> listCompanyMembers(Long companyId) {
        return companyMemberRepository.findByCompanyId(companyId).stream()
                .map(this::toCompanyMemberResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AdminCompanyMemberResponse> listAllCompanyMembers() {
        return companyMemberRepository.findAll().stream()
                .map(this::toCompanyMemberResponse).toList();
    }

    @Transactional
    public AdminCompanyMemberResponse addCompanyMember(Long companyId, AddCompanyMemberRequest req) {
        Company company = findCompanyOrThrow(companyId);
        User user = findUserOrThrow(req.getUserId());

        CompanyMemberId memberId = new CompanyMemberId(companyId, req.getUserId());
        if (companyMemberRepository.existsById(memberId)) {
            throw new BadRequestException("User is already a member of this company");
        }

        CompanyMember member = new CompanyMember();
        member.setCompany(company);
        member.setUser(user);
        member.setMemberRole(req.getMemberRole().trim().toLowerCase());
        return toCompanyMemberResponse(companyMemberRepository.save(member));
    }

    @Transactional
    public void removeCompanyMember(Long companyId, Long userId) {
        CompanyMemberId memberId = new CompanyMemberId(companyId, userId);
        if (!companyMemberRepository.existsById(memberId)) {
            throw new NotFoundException("Company member not found");
        }
        companyMemberRepository.deleteById(memberId);
    }

    // ── Guides ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminGuideResponse> listGuides() {
        return guideRepository.findAll().stream().map(this::toGuideResponse).toList();
    }

    @Transactional(readOnly = true)
    public AdminGuideResponse getGuide(Long userId) {
        return toGuideResponse(findGuideOrThrow(userId));
    }

    @Transactional
    public AdminGuideResponse verifyGuide(Long userId) {
        Guide guide = findGuideOrThrow(userId);
        guide.setVerificationStatus("verified");
        return toGuideResponse(guideRepository.save(guide));
    }

    @Transactional
    public AdminGuideResponse rejectGuide(Long userId) {
        Guide guide = findGuideOrThrow(userId);
        guide.setVerificationStatus("rejected");
        return toGuideResponse(guideRepository.save(guide));
    }

    @Transactional
    public void deleteGuide(Long userId) {
        if (!guideRepository.existsById(userId)) throw new NotFoundException("Guide not found");
        guideRepository.deleteById(userId);
    }

    // ── Roles ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminRoleResponse> listRoles() {
        return roleRepository.findAll().stream().map(this::toRoleResponse).toList();
    }

    @Transactional
    public AdminRoleResponse createRole(CreateRoleRequest req) {
        String name = req.getName().trim().toUpperCase();
        if (roleRepository.existsByName(name)) {
            throw new BadRequestException("Role '" + name + "' already exists");
        }
        Role role = roleRepository.save(new Role(name));
        return toRoleResponse(role);
    }

    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Role not found"));
        if (!role.getUsers().isEmpty()) {
            throw new BadRequestException("Cannot delete role that is assigned to users");
        }
        roleRepository.delete(role);
    }

    // ── Mappers ────────────────────────────────────────────────

    private AdminUserResponse toUserResponse(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName).sorted().toList();
        AdminUserResponse r = new AdminUserResponse();
        r.setId(user.getId());
        r.setFullName(user.getFullName());
        r.setEmail(user.getEmail());
        r.setPhone(user.getPhone());
        r.setVerified(user.isVerified());
        r.setEnabled(user.isEnabled());
        r.setCreatedAt(user.getCreatedAt());
        r.setRoles(roleNames);
        return r;
    }

    private AdminCompanyResponse toCompanyResponse(Company company) {
        int memberCount = companyMemberRepository.findByCompanyId(company.getId()).size();
        return new AdminCompanyResponse(
                company.getId(), company.getName(), company.getDescription(),
                company.isVerified(), company.getCreatedAt(), memberCount
        );
    }

    private AdminGuideResponse toGuideResponse(Guide guide) {
        AdminGuideResponse r = new AdminGuideResponse();
        r.setUserId(guide.getUserId());
        r.setFullName(guide.getUser().getFullName());
        r.setEmail(guide.getUser().getEmail());
        r.setGuideType(guide.getGuideType());
        r.setVerificationStatus(guide.getVerificationStatus());
        r.setBio(guide.getBio());
        r.setLanguages(guide.getLanguages());
        if (guide.getCompany() != null) {
            r.setCompanyId(guide.getCompany().getId());
            r.setCompanyName(guide.getCompany().getName());
        }
        return r;
    }

    private AdminRoleResponse toRoleResponse(Role role) {
        return new AdminRoleResponse(role.getId(), role.getName(), role.getUsers().size());
    }

    private AdminCompanyMemberResponse toCompanyMemberResponse(CompanyMember member) {
        AdminCompanyMemberResponse r = new AdminCompanyMemberResponse();
        r.setCompanyId(member.getCompanyId());
        r.setCompanyName(member.getCompany().getName());
        r.setUserId(member.getUserId());
        r.setUserFullName(member.getUser().getFullName());
        r.setUserEmail(member.getUser().getEmail());
        r.setMemberRole(member.getMemberRole());
        r.setStatus(member.getStatus());
        return r;
    }

    // ── Helpers ────────────────────────────────────────────────

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private Company findCompanyOrThrow(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Company not found"));
    }

    private Guide findGuideOrThrow(Long userId) {
        return guideRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Guide not found"));
    }
}
