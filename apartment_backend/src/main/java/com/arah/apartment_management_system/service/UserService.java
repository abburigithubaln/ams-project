package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.user.CreateUserRequest;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.entity.User;

public interface UserService {

    User createUser(CreateUserRequest request);

    List<UserResponse> getAllUsers();

    void updateUser(Long id, UpdateUserRequest request);

    void deactivateUser(Long id);

    List<UserResponse> getPendingUsers();

    void approveUser(Long userId);

    void rejectUser(Long userId);

    User getLoggedInUser();

    UserResponse getLoggedInUserProfile();

    UserResponse getUserByUsername(String username);

    void updateProfile(String username, UpdateUserRequest request);

    void changePassword(String username, com.arah.apartment_management_system.dto.user.ChangePasswordRequest request);

    void reactivateUser(Long id);

    List<UserResponse> getUsersByRole(String roleName);

}