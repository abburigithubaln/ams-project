package com.arah.apartment_management_system.service.impl;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.auth.LoginRequest;
import com.arah.apartment_management_system.dto.auth.SignupRequest;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.security.JwtUtil;
import com.arah.apartment_management_system.service.AuthService;
import com.arah.apartment_management_system.service.EmailService;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final com.arah.apartment_management_system.repository.ApartmentRepository apartmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public void generateResetToken(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        userRepository.save(user);

        emailService.sendResetPasswordEmail(user.getEmail(), token);
    }

    @Override
    public void resetPassword(String token, String newPassword) {

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired. Please request a new reset link.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);
    }

    @Override
    public void registerResident(SignupRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        com.arah.apartment_management_system.entity.Apartment apartment = apartmentRepository
                .findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Selected apartment not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setContactNumber(request.getContactNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_RESIDENT);
        user.setStatus(UserStatus.PENDING);
        user.setManagedApartment(apartment);

        userRepository.save(user);
    }

    @Override
    public String login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with username or email: " + request.getUsername()));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        request.getPassword()));

        if (user.getStatus() != UserStatus.APPROVED) {
            throw new RuntimeException("Account is not active. Please contact the administrator.");
        }

        return jwtUtil.generateToken(
                user.getUsername(),
                user.getRole().name());
    }

}
