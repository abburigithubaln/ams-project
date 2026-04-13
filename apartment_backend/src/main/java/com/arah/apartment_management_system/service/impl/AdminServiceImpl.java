package com.arah.apartment_management_system.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.staff.CreateStaffRequest;
import com.arah.apartment_management_system.dto.staff.StaffResponse;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.FlatStatus;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;
import com.arah.apartment_management_system.mapper.UserMapper;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.service.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final FlatRepository flatRepository;
    private final AllotmentRepository allotmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final com.arah.apartment_management_system.service.UserService userService;

    @Override
    public Allotment allocateFlatToUser(Long userId, Long flatId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Flat flat = flatRepository.findById(flatId)
                .orElseThrow(() -> new RuntimeException("Flat not found"));

        Allotment allotment = new Allotment();
        allotment.setUser(user);
        allotment.setFlat(flat);
        allotment.setStartDate(LocalDate.now());
        allotment.setStatus(AllotmentStatus.ACTIVE);
        flat.setStatus(FlatStatus.ALLOCATED);
        user.setStatus(UserStatus.APPROVED);

        return allotmentRepository.save(allotment);
    }

    @Override
    public void approveAndAllocate(Long userId, Long flatId) {
        User admin = userService.getLoggedInUser();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Flat flat = flatRepository.findById(flatId)
                .orElseThrow(() -> new RuntimeException("Flat not found"));

        if (admin.getRole() != Role.ROLE_SUPER_ADMIN) {
            if (flat.getBlock() == null || !flat.getBlock().getApartment().getId().equals(admin.getManagedApartment().getId())) {
                throw new RuntimeException("Unauthorized: Flat belongs to another apartment");
            }
        }

        if (flat.getStatus() == FlatStatus.ALLOCATED) {
            throw new RuntimeException("Flat already allocated");
        }

        user.setStatus(UserStatus.APPROVED);
        userRepository.save(user);

        Allotment allotment = new Allotment();
        allotment.setUser(user);
        allotment.setFlat(flat);
        allotment.setStartDate(LocalDate.now());
        allotment.setStatus(AllotmentStatus.ACTIVE);
        allotmentRepository.save(allotment);

        flat.setStatus(FlatStatus.ALLOCATED);
        flatRepository.save(flat);
    }

    @Override
    public void createStaff(CreateStaffRequest request) {
        User admin = userService.getLoggedInUser();

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User staff = new User();
        staff.setUsername(request.getUsername());
        staff.setEmail(request.getEmail());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setRole(Role.ROLE_SECURITY);
        staff.setStatus(UserStatus.APPROVED);
        staff.setContactNumber(request.getContactNumber());
        staff.setDesignation(request.getDesignation());
        
        if (admin.getManagedApartment() != null) {
            staff.setManagedApartment(admin.getManagedApartment());
        }
        userRepository.save(staff);
    }

    @Override
    public List<StaffResponse> getAllStaff() {
        User admin = userService.getLoggedInUser();
        List<User> staffList;
        
        if (admin.getRole() == Role.ROLE_SUPER_ADMIN) {
            staffList = userRepository.findByRoleAndStatus(Role.ROLE_SECURITY, UserStatus.APPROVED);
        } else if (admin.getManagedApartment() != null) {
            staffList = userRepository.findByManagedApartmentId(admin.getManagedApartment().getId()).stream()
                    .filter(u -> u.getRole() == Role.ROLE_SECURITY && u.getStatus() == UserStatus.APPROVED)
                    .toList();
        } else {
            staffList = List.of();
        }

        return staffList.stream()
                .map(user -> StaffResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .contactNumber(user.getContactNumber())
                        .designation(user.getDesignation())
                        .role(user.getRole() != null ? user.getRole().name().replace("ROLE_", "") : null)
                        .build())
                .toList();
    }

    @Override
    public List<StaffResponse> getStaffByApartmentForCurrentUser() {
        User loggedInUser = userService.getLoggedInUser();
        User currentUser = userRepository.findById(loggedInUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() == Role.ROLE_SUPER_ADMIN) {
            return userRepository.findByRoleAndStatus(Role.ROLE_SECURITY, UserStatus.APPROVED)
                    .stream()
                    .map(user -> StaffResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .contactNumber(user.getContactNumber())
                            .designation(user.getDesignation())
                            .role(user.getRole() != null ? user.getRole().name().replace("ROLE_", "") : null)
                            .build())
                    .toList();
        }

        Long aptId = currentUser.getManagedApartment() != null 
                ? currentUser.getManagedApartment().getId()
                : currentUser.getAllotments() != null ? currentUser.getAllotments().stream()
                    .filter(a -> a.getStatus() == AllotmentStatus.ACTIVE)
                    .findFirst()
                    .map(a -> a.getFlat().getBlock().getApartment().getId())
                    .orElse(null) : null;

        if (aptId == null) {
            return List.of();
        }

        return userRepository.findByManagedApartmentId(aptId).stream()
                .filter(u -> u.getRole() == Role.ROLE_SECURITY && u.getStatus() == UserStatus.APPROVED)
                .map(user -> StaffResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .contactNumber(user.getContactNumber())
                        .designation(user.getDesignation())
                        .role(user.getRole() != null ? user.getRole().name().replace("ROLE_", "") : null)
                        .build())
                .toList();
    }

    @Override
    public void updateStaff(Long id, CreateStaffRequest request) {
        User admin = userService.getLoggedInUser();
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (admin.getRole() != Role.ROLE_SUPER_ADMIN && 
            (staff.getManagedApartment() == null || !staff.getManagedApartment().getId().equals(admin.getManagedApartment().getId()))) {
            throw new RuntimeException("Unauthorized to update this staff");
        }

        if (!staff.getUsername().equals(request.getUsername())
                && userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (!staff.getEmail().equals(request.getEmail())
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        staff.setUsername(request.getUsername());
        staff.setEmail(request.getEmail());
        staff.setContactNumber(request.getContactNumber());
        staff.setDesignation(request.getDesignation());
        userRepository.save(staff);
    }

    @Override
    public void deleteStaff(Long id) {
        User admin = userService.getLoggedInUser();
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (admin.getRole() != Role.ROLE_SUPER_ADMIN && 
            (staff.getManagedApartment() == null || !staff.getManagedApartment().getId().equals(admin.getManagedApartment().getId()))) {
            throw new RuntimeException("Unauthorized to delete this staff");
        }

        if (staff.getRole() != Role.ROLE_SECURITY) {
            throw new RuntimeException("Invalid staff role");
        }
        staff.setStatus(UserStatus.DEACTIVATED);
        userRepository.save(staff);
    }

    @Override
    public List<StaffResponse> getDeactivatedStaff() {
        User admin = userService.getLoggedInUser();
        List<User> deactivatedList;

        if (admin.getRole() == Role.ROLE_SUPER_ADMIN) {
            deactivatedList = userRepository.findByRoleAndStatus(Role.ROLE_SECURITY, UserStatus.DEACTIVATED);
        } else if (admin.getManagedApartment() != null) {
            deactivatedList = userRepository.findByManagedApartmentId(admin.getManagedApartment().getId()).stream()
                    .filter(u -> u.getRole() == Role.ROLE_SECURITY && u.getStatus() == UserStatus.DEACTIVATED)
                    .toList();
        } else {
            deactivatedList = List.of();
        }

        return deactivatedList.stream()
                .map(user -> StaffResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .contactNumber(user.getContactNumber())
                        .designation(user.getDesignation())
                        .role(user.getRole() != null ? user.getRole().name().replace("ROLE_", "") : null)
                        .build())
                .toList();
    }

    @Override
    public void reactivateStaff(Long id) {
        User admin = userService.getLoggedInUser();
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (admin.getRole() != Role.ROLE_SUPER_ADMIN && 
            (staff.getManagedApartment() == null || !staff.getManagedApartment().getId().equals(admin.getManagedApartment().getId()))) {
            throw new RuntimeException("Unauthorized to reactivate this staff");
        }

        if (staff.getRole() != Role.ROLE_SECURITY) {
            throw new RuntimeException("Invalid staff role");
        }
        staff.setStatus(UserStatus.APPROVED);
        userRepository.save(staff);
    }

    @Override
    public List<UserResponse> getAllResidents() {
        User admin = userService.getLoggedInUser();
        List<User> residentList;
        
        if (admin.getRole() == Role.ROLE_SUPER_ADMIN) {
            residentList = userRepository.findByRoleIn(List.of(Role.ROLE_RESIDENT));
        } else if (admin.getManagedApartment() != null) {
            residentList = userRepository.findAllByApartmentId(admin.getManagedApartment().getId()).stream()
                    .filter(u -> u.getRole() == Role.ROLE_RESIDENT)
                    .toList();
        } else {
            residentList = List.of();
        }

        return residentList.stream()
                .filter(user -> user.getStatus() == UserStatus.APPROVED)
                .map(userMapper::toUserResponse)
                .toList();
    }
}