package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.dto.auth.*;
import com.arah.apartment_management_system.service.AuthService;
import com.arah.apartment_management_system.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<String> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ApiResponse.success("Login successful", token);
    }

    @PostMapping("/signup")
    public ApiResponse<String> signup(@Valid @RequestBody SignupRequest request) {
        authService.registerResident(request);
        return ApiResponse.success(
                "Registration submitted. Wait for admin approval.",
                null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.generateResetToken(request.getEmail());
        return ApiResponse.success("Reset link sent to your email", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ApiResponse.success("Password updated successfully", null);
    }
}
