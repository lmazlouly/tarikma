package com.tarikma.app.service;

import com.tarikma.app.dto.auth.RegisterRequest;
import com.tarikma.app.dto.auth.RegistrationUserType;
import com.tarikma.app.entity.Company;
import com.tarikma.app.entity.CompanyMember;
import com.tarikma.app.entity.Guide;
import com.tarikma.app.entity.Role;
import com.tarikma.app.entity.User;
import com.tarikma.app.exception.ConflictException;
import com.tarikma.app.repository.CompanyMemberRepository;
import com.tarikma.app.repository.CompanyRepository;
import com.tarikma.app.repository.GuideRepository;
import com.tarikma.app.repository.RoleRepository;
import com.tarikma.app.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMemberRepository companyMemberRepository;
    private final GuideRepository guideRepository;

    public UserService(
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RoleRepository roleRepository,
            CompanyRepository companyRepository,
            CompanyMemberRepository companyMemberRepository,
            GuideRepository guideRepository
    ) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.companyRepository = companyRepository;
        this.companyMemberRepository = companyMemberRepository;
        this.guideRepository = guideRepository;
    }

    @Transactional
    public User register(RegisterRequest request) {
        Objects.requireNonNull(request.getUserType(), "userType");
        Objects.requireNonNull(request.getFullName(), "fullName");
        Objects.requireNonNull(request.getEmail(), "email");
        Objects.requireNonNull(request.getPassword(), "password");

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("email must not be blank");
        }

        if (request.getPassword().isBlank()) {
            throw new IllegalArgumentException("password must not be blank");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("email already registered");
        }

        RegistrationUserType userType = request.getUserType();

        if (userType == RegistrationUserType.COMPANY) {
            if (request.getCompanyName() == null || request.getCompanyName().isBlank()) {
                throw new IllegalArgumentException("companyName is required for company registration");
            }
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());

        String roleName = switch (userType) {
            case TOURIST -> "CUSTOMER";
            case COMPANY -> "COMPANY_OWNER";
            case GUIDE -> "GUIDE";
        };

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));

        User user = new User(request.getFullName().trim(), normalizedEmail, passwordHash);
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }
        user.getRoles().add(role);
        user = userRepository.save(user);

        if (userType == RegistrationUserType.COMPANY) {
            Company company = new Company(
                    request.getCompanyName().trim(),
                    request.getCompanyDescription()
            );
            company = companyRepository.save(company);

            CompanyMember owner = new CompanyMember();
            owner.setCompanyId(company.getId());
            owner.setUserId(user.getId());
            owner.setCompany(company);
            owner.setUser(user);
            owner.setMemberRole("owner");
            companyMemberRepository.save(owner);
        }

        if (userType == RegistrationUserType.GUIDE) {
            Guide guide = new Guide();
            guide.setUser(user);
            guide.setGuideType("independent");
            guide.setBio(request.getBio());
            guide.setLanguages(request.getLanguages());
            guideRepository.save(guide);
        }

        return user;
    }

    public User authenticate(String email, String rawPassword) {
        Objects.requireNonNull(email, "email");
        Objects.requireNonNull(rawPassword, "rawPassword");

        String normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("invalid credentials");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("invalid credentials"));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("invalid credentials");
        }

        return user;
    }
}
