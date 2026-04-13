package com.arah.apartment_management_system.service;

import com.arah.apartment_management_system.dto.auth.LoginRequest;
import com.arah.apartment_management_system.dto.auth.SignupRequest;

public interface AuthService {

	void generateResetToken(String email);

    void resetPassword(String token, String newPassword);

	void registerResident(SignupRequest request);
	
	String login(LoginRequest request);
}
