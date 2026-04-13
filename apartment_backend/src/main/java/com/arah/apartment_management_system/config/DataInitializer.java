package com.arah.apartment_management_system.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;
import com.arah.apartment_management_system.repository.UserRepository;

@Component
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void createTestUsers() {

        createUserIfNotFound("superadmin", "superadmin@gmail.com", "9000000001", "superadmin123",
                Role.ROLE_SUPER_ADMIN);

        createUserIfNotFound("admin", "admin@gmail.com", "9000000002", "admin123", Role.ROLE_ADMIN);

        createUserIfNotFound("security", "security@gmail.com", "9000000003", "security123", Role.ROLE_SECURITY);

        createUserIfNotFound("resident", "resident@gmail.com", "9000000004", "resident123", Role.ROLE_RESIDENT);
    }

    private void createUserIfNotFound(String username, String email, String contactNumber, String password, Role role) {

        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);

        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setContactNumber(contactNumber);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setStatus(UserStatus.APPROVED);
            if (role == Role.ROLE_SECURITY) {
                user.setDesignation("Security Guard");
            }
            userRepository.save(user);
            System.out.println(role + " user created: " + username);
        } else {
            boolean changed = false;
            if (user.getRole() == Role.ROLE_SUPER_ADMIN || user.getRole() == Role.ROLE_ADMIN) {
                if (user.getStatus() != UserStatus.APPROVED) {
                    user.setStatus(UserStatus.APPROVED);
                    changed = true;
                }
                if (user.getRole() != role && role == Role.ROLE_SUPER_ADMIN) {
                    user.setRole(Role.ROLE_SUPER_ADMIN);
                    changed = true;
                }
            }
            if (changed) {
                userRepository.save(user);
                System.out.println(role + " user configuration updated: " + username);
            }
        }
    }
}