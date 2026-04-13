package com.arah.apartment_management_system.controller;

import java.security.Principal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.security.VehicleDTO;
import com.arah.apartment_management_system.dto.security.VisitorDTO;
import com.arah.apartment_management_system.dto.staff.CreateStaffRequest;
import com.arah.apartment_management_system.dto.staff.StaffResponse;
import com.arah.apartment_management_system.dto.user.CreateUserRequest;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.ChangePasswordRequest;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.entity.Vehicle;
import com.arah.apartment_management_system.entity.Visitor;
import com.arah.apartment_management_system.mapper.SecurityMapper;
import com.arah.apartment_management_system.repository.VehicleRepository;
import com.arah.apartment_management_system.repository.VisitorRepository;
import com.arah.apartment_management_system.repository.ParcelRepository;
import com.arah.apartment_management_system.service.AdminService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.util.ApiResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AdminService adminService;
    private final VisitorRepository visitorRepository;
    private final VehicleRepository vehicleRepository;
    private final ParcelRepository parcelRepository;
    private final SecurityMapper securityMapper;

    @GetMapping("/users")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.success(
                "Users fetched successfully",
                userService.getAllUsers());
    }

    @PutMapping("/users/{id}")
    public ApiResponse<String> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        userService.updateUser(id, request);
        return ApiResponse.success("User updated successfully", null);
    }

    @PutMapping("/users/{id}/deactivate")
    public ApiResponse<String> deleteUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ApiResponse.success("User deactivated successfully", null);
    }

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfile() {

        return ApiResponse.success(
                "Profile fetched successfully",
                userService.getLoggedInUserProfile());
    }

    @PutMapping("/update-profile")
    public ApiResponse<String> updateProfile(
            Principal principal,
            @RequestBody UpdateUserRequest request) {

        userService.updateProfile(principal.getName(), request);

        return ApiResponse.success("Profile updated successfully", null);
    }

    @PutMapping("/change-password")
    public ApiResponse<String> changePassword(
            Principal principal,
            @RequestBody ChangePasswordRequest request) {

        userService.changePassword(principal.getName(), request);
        return ApiResponse.success("Password changed successfully", null);
    }

    @GetMapping("/pending-users")
    public ApiResponse<List<UserResponse>> getPendingUsers() {
        return ApiResponse.success(
                "Pending users fetched",
                userService.getPendingUsers());
    }

    @PostMapping("/users")
    public ApiResponse<String> createUser(@RequestBody CreateUserRequest request) {
        userService.createUser(request);

        return ApiResponse.success("User created successfully", null);
    }

    @PutMapping("/users/{id}/approve")
    public ApiResponse<String> approveUser(
            @PathVariable Long id,
            @RequestParam Long flatId) {

        adminService.approveAndAllocate(id, flatId);
        return ApiResponse.success("User approved and flat allocated", null);
    }

    @PutMapping("/users/{id}/reject")
    public ApiResponse<String> rejectUser(@PathVariable Long id) {
        userService.rejectUser(id);
        return ApiResponse.success("User rejected", null);
    }

    @PutMapping("/users/{id}/reactivate")
    public ApiResponse<String> reactivateUser(@PathVariable Long id) {
        userService.reactivateUser(id);
        return ApiResponse.success("User reactivated successfully", null);
    }

    @PutMapping("/users/{userId}/allocate/{flatId}")
    public ApiResponse<String> allocateFlat(
            @PathVariable Long userId,
            @PathVariable Long flatId) {

        adminService.allocateFlatToUser(userId, flatId);
        return ApiResponse.success("Flat allocated successfully", null);
    }

    @PostMapping("/staff")
    public ApiResponse<String> createStaff(
            @RequestBody CreateStaffRequest request) {

        adminService.createStaff(request);
        return ApiResponse.success("Staff created successfully", null);
    }

    @GetMapping("/staff")
    public ApiResponse<List<StaffResponse>> getAllStaff() {

        return ApiResponse.success(
                "Staff fetched successfully",
                adminService.getAllStaff());
    }

    @PutMapping("/staff/{id}")
    public ApiResponse<String> updateStaff(
            @PathVariable Long id,
            @RequestBody CreateStaffRequest request) {

        adminService.updateStaff(id, request);
        return ApiResponse.success("Staff updated successfully", null);
    }

    @PutMapping("/staff/{id}/deactivate")
    public ApiResponse<String> deactivateStaff(@PathVariable Long id) {

        adminService.deleteStaff(id);
        return ApiResponse.success("Staff deactivated successfully", null);
    }

    @PutMapping("/staff/{id}/reactivate")
    public ApiResponse<String> reactivateStaff(@PathVariable Long id) {

        adminService.reactivateStaff(id);
        return ApiResponse.success("Staff reactivated successfully", null);
    }

    @GetMapping("/staff/deactivated")
    public ApiResponse<List<StaffResponse>> getDeactivatedStaff() {

        return ApiResponse.success(
                "Deactivated staff fetched successfully",
                adminService.getDeactivatedStaff());
    }

    @GetMapping("/visitors")
    public ApiResponse<List<VisitorDTO>> getAllVisitors() {
        User loggedInUser = userService.getLoggedInUser();
        List<Visitor> visitors;
        
        if (loggedInUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            visitors = visitorRepository.findAll();
        } else if (loggedInUser.getManagedApartment() != null) {
            visitors = visitorRepository.findByApartmentId(loggedInUser.getManagedApartment().getId());
        } else {
            visitors = List.of();
        }

        List<VisitorDTO> visitorDTOs = visitors.stream()
                .sorted(Comparator.comparing(Visitor::getEntryTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(securityMapper::toVisitorDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Visitors fetched", visitorDTOs);
    }

    @GetMapping("/vehicles")
    public ApiResponse<List<VehicleDTO>> getAllVehicles() {
        User loggedInUser = userService.getLoggedInUser();
        List<Vehicle> vehicles;

        if (loggedInUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            vehicles = vehicleRepository.findAll();
        } else if (loggedInUser.getManagedApartment() != null) {
            vehicles = vehicleRepository.findByApartmentId(loggedInUser.getManagedApartment().getId());
        } else {
            vehicles = List.of();
        }

        List<VehicleDTO> vehicleDTOs = vehicles.stream()
                .sorted(Comparator.comparing(Vehicle::getEntryTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(securityMapper::toVehicleDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Vehicles fetched", vehicleDTOs);
    }

    @GetMapping("/parcels")
    public ApiResponse<List<com.arah.apartment_management_system.dto.security.ParcelDTO>> getAllParcels() {
        User loggedInUser = userService.getLoggedInUser();
        List<com.arah.apartment_management_system.entity.Parcel> parcels;

        if (loggedInUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            parcels = parcelRepository.findAll();
        } else if (loggedInUser.getManagedApartment() != null) {
            parcels = parcelRepository.findByApartmentId(loggedInUser.getManagedApartment().getId());
        } else {
            parcels = List.of();
        }

        List<com.arah.apartment_management_system.dto.security.ParcelDTO> parcelDTOs = parcels.stream()
                .sorted(Comparator.comparing(com.arah.apartment_management_system.entity.Parcel::getReceivedTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(securityMapper::toParcelDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Parcels fetched", parcelDTOs);
    }

    @GetMapping("/residents")
    public ApiResponse<List<UserResponse>> getAllResidents() {
        return ApiResponse.success("Residents fetched successfully", adminService.getAllResidents());
    }
}