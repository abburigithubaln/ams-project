package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.dto.maintenance.AdminUpdateServiceRequestDTO;
import com.arah.apartment_management_system.dto.maintenance.CreateServiceRequestDTO;
import com.arah.apartment_management_system.dto.maintenance.MaintenanceServiceResponseDTO;
import com.arah.apartment_management_system.service.MaintenanceRequestService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MaintenanceRequestController {

    private final MaintenanceRequestService service;
    private final UserService userService;

    @PreAuthorize("hasRole('RESIDENT')")
    @PostMapping("/user/maintenance-requests")
    public ApiResponse<MaintenanceServiceResponseDTO> raiseRequest(@RequestBody CreateServiceRequestDTO requestDTO) {
        Long userId = userService.getLoggedInUser().getId();
        return ApiResponse.success("Request raised successfully", service.raiseRequest(requestDTO, userId));
    }

    @PreAuthorize("hasRole('RESIDENT')")
    @GetMapping("/user/maintenance-requests")
    public ApiResponse<List<MaintenanceServiceResponseDTO>> getMyRequests() {
        Long userId = userService.getLoggedInUser().getId();
        return ApiResponse.success("Requests fetched successfully", service.getResidentRequests(userId));
    }

    @PreAuthorize("hasRole('RESIDENT')")
    @PutMapping("/user/maintenance-requests/{id}/cancel")
    public ApiResponse<Void> cancelRequest(@PathVariable Long id) {
        Long userId = userService.getLoggedInUser().getId();
        service.cancelRequest(id, userId);
        return ApiResponse.success("Request cancelled successfully", null);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/maintenance-requests")
    public ApiResponse<List<MaintenanceServiceResponseDTO>> getAllRequests() {
        return ApiResponse.success("All requests fetched successfully", service.getAllRequests());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/maintenance-requests/{id}")
    public ApiResponse<MaintenanceServiceResponseDTO> updateRequest(
            @PathVariable Long id,
            @RequestBody AdminUpdateServiceRequestDTO updateDTO) {
        return ApiResponse.success("Request updated successfully", service.updateByAdmin(id, updateDTO));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/maintenance-requests/{id}")
    public ApiResponse<Void> deleteRequest(@PathVariable Long id) {
        service.deleteRequest(id);
        return ApiResponse.success("Request deleted successfully", null);
    }

    @GetMapping("/maintenance-requests/charges")
    public ApiResponse<Map<String, Double>> getBasicCharges() {
        return ApiResponse.success("Basic charges fetched", service.getBasicCharges());
    }
}
