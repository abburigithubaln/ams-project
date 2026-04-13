package com.arah.apartment_management_system.service.impl;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.user.CreateUserRequest;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.ChangePasswordRequest;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.entity.Apartment;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.FlatStatus;
import com.arah.apartment_management_system.enums.UserStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.mapper.UserMapper;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.ApartmentRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.security.CustomUserDetails;
import com.arah.apartment_management_system.service.UserService;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AllotmentRepository apartmentAllotmentRepository;
    private final FlatRepository flatRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserMapper userMapper;

    @Override
    public User createUser(CreateUserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setContactNumber(request.getContactNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if (com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN.equals(request.getRole())) {
            User loggedInUser = getLoggedInUser();
            if (loggedInUser.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
                throw new RuntimeException("Any apartment admin cannot add super admin");
            }
        }
        user.setRole(request.getRole());

        if (request.getApartmentId() != null) {
            Apartment apt = apartmentRepository.findById(request.getApartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));
            user.setManagedApartment(apt);
        } else {
            try {
                User loggedInUser = getLoggedInUser();
                if (loggedInUser != null && loggedInUser.getManagedApartment() != null) {
                    user.setManagedApartment(loggedInUser.getManagedApartment());
                }
            } catch (Exception e) {
            }
        }

        if (com.arah.apartment_management_system.enums.Role.ROLE_RESIDENT.equals(request.getRole())) {
            user.setStatus(UserStatus.PENDING);
        } else {
            user.setStatus(UserStatus.APPROVED);
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public List<UserResponse> getPendingUsers() {
        User admin = getLoggedInUser();
        List<User> pendingUsers;

        if (admin.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            pendingUsers = userRepository.findByStatus(UserStatus.PENDING);
        } else if (admin.getManagedApartment() != null) {
            Long adminAptId = admin.getManagedApartment().getId();
            pendingUsers = userRepository.findByStatus(UserStatus.PENDING).stream()
                    .filter(u -> {
                        if (u.getManagedApartment() != null && u.getManagedApartment().getId().equals(adminAptId)) {
                            return true;
                        }
                        return u.getAllotments() != null && u.getAllotments().stream()
                                .anyMatch(a -> a.getFlat() != null && a.getFlat().getBlock() != null &&
                                        a.getFlat().getBlock().getApartment().getId().equals(adminAptId));
                    })
                    .toList();
        } else {
            pendingUsers = List.of();
        }

        return pendingUsers.stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    @Override
    public void approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.APPROVED);
        userRepository.save(user);
    }

    @Override
    public void rejectUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.REJECTED);
        userRepository.save(user);
    }

    @Override
    public User getLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }

    @Override
    @Transactional
    public UserResponse getLoggedInUserProfile() {
        User loggedInUser = getLoggedInUser();
        User user = userRepository.findById(loggedInUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public List<UserResponse> getAllUsers() {
        User loggedInUser = getLoggedInUser();
        List<User> userList;

        if (loggedInUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            userList = userRepository.findAll();
        } else if (loggedInUser.getManagedApartment() != null) {
            userList = userRepository.findAllByApartmentId(loggedInUser.getManagedApartment().getId());
        } else {
            userList = List.of();
        }

        return userList.stream().map(userMapper::toUserResponse).toList();
    }

    @Override
    public void updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User loggedInUser = getLoggedInUser();

        if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                loggedInUser.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            throw new RuntimeException("Any apartment admin cannot update a super admin");
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            user.setStatus(UserStatus.valueOf(request.getStatus()));
        }
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (!user.getUsername().equals(request.getUsername())
                    && userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!user.getEmail().equals(request.getEmail())
                    && userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getContactNumber() != null && !request.getContactNumber().isBlank()) {
            user.setContactNumber(request.getContactNumber());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getProfilePictureUrl() != null && !request.getProfilePictureUrl().isBlank()) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            com.arah.apartment_management_system.enums.Role newRole = com.arah.apartment_management_system.enums.Role
                    .valueOf(request.getRole());
            if (newRole == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                    loggedInUser.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
                throw new RuntimeException("Any apartment admin cannot add super admin");
            }
            user.setRole(newRole);
        }
        if (request.getApartmentId() != null) {
            Apartment apt = apartmentRepository.findById(request.getApartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));
            user.setManagedApartment(apt);
        }

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User loggedInUser = getLoggedInUser();
        if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                loggedInUser.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            throw new RuntimeException("Any apartment admin cannot deactivate a super admin");
        }

        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new RuntimeException("User already deactivated");
        }

        user.setStatus(UserStatus.DEACTIVATED);

        apartmentAllotmentRepository
                .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                .ifPresent(allotment -> {
                    allotment.setStatus(AllotmentStatus.VACATED);
                    allotment.setEndDate(LocalDate.now());
                    apartmentAllotmentRepository.save(allotment);

                    Flat flat = allotment.getFlat();
                    if (flat != null) {
                        flat.setStatus(FlatStatus.AVAILABLE);
                        flatRepository.save(flat);
                    }
                });

        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toUserResponse(user);
    }

    @Override
    public void reactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User loggedInUser = getLoggedInUser();
        if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                loggedInUser.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            throw new RuntimeException("Any apartment admin cannot reactivate a super admin");
        }

        user.setStatus(UserStatus.APPROVED);
        userRepository.save(user);
    }

    @Override
    public void updateProfile(String username, UpdateUserRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (!user.getUsername().equals(request.getUsername())
                    && userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!user.getEmail().equals(request.getEmail())
                    && userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getContactNumber() != null && !request.getContactNumber().isBlank()) {
            user.setContactNumber(request.getContactNumber());
        }
        if (request.getProfilePictureUrl() != null && !request.getProfilePictureUrl().isBlank()) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        if (request.getAadharUrl() != null && !request.getAadharUrl().isBlank()) {
            user.setAadharUrl(request.getAadharUrl());
        }
        if (request.getPanCardUrl() != null && !request.getPanCardUrl().isBlank()) {
            user.setPanCardUrl(request.getPanCardUrl());
        }

        userRepository.save(user);
    }

    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<UserResponse> getUsersByRole(String roleName) {
        com.arah.apartment_management_system.enums.Role role = com.arah.apartment_management_system.enums.Role
                .valueOf(roleName);
        return userRepository.findByRole(role).stream()
                .map(userMapper::toUserResponse)
                .toList();
    }
}