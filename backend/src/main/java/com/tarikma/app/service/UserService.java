package com.tarikma.app.service;

import com.tarikma.app.entity.Role;
import com.tarikma.app.entity.User;
import com.tarikma.app.repository.RoleRepository;
import com.tarikma.app.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class UserService {

    private static final String DEFAULT_ROLE = "USER";

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RoleRepository roleRepository
    ) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public User register(String username, String rawPassword, String roleName) {
        Objects.requireNonNull(username, "username");
        Objects.requireNonNull(rawPassword, "rawPassword");

        String normalized = username.trim();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("username must not be blank");
        }

        if (rawPassword.isBlank()) {
            throw new IllegalArgumentException("password must not be blank");
        }

        if (userRepository.existsByUsername(normalized)) {
            throw new IllegalArgumentException("username already exists");
        }

        String passwordHash = passwordEncoder.encode(rawPassword);

        String normalizedRole = normalizeRoleName(roleName);
        Role role = roleRepository.findByName(normalizedRole)
                .orElseGet(() -> roleRepository.save(new Role(normalizedRole)));

        User user = new User(normalized, passwordHash);
        user.getRoles().add(role);

        return userRepository.save(user);
    }

    @Transactional
    public User register(String username, String rawPassword) {
        return register(username, rawPassword, null);
    }

    public User authenticate(String username, String rawPassword) {
        Objects.requireNonNull(username, "username");
        Objects.requireNonNull(rawPassword, "rawPassword");

        String normalized = username.trim();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("invalid credentials");
        }

        User user = userRepository.findByUsername(normalized)
                .orElseThrow(() -> new IllegalArgumentException("invalid credentials"));

        if (!user.isEnabled()) {
            throw new IllegalArgumentException("invalid credentials");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("invalid credentials");
        }

        return user;
    }

    private static String normalizeRoleName(String roleName) {
        if (roleName == null) {
            return DEFAULT_ROLE;
        }

        String normalized = roleName.trim();
        if (normalized.isBlank()) {
            return DEFAULT_ROLE;
        }

        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring("ROLE_".length());
        }

        return normalized.toUpperCase();
    }
}
