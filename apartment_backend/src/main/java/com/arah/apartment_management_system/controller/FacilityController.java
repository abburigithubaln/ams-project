package com.arah.apartment_management_system.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.facility.FacilityRequestDTO;
import com.arah.apartment_management_system.dto.facility.FacilityResponseDTO;
import com.arah.apartment_management_system.service.FacilityService;
import com.arah.apartment_management_system.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;


    @PostMapping("/api/admin/facilities")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FacilityResponseDTO> createFacility(
            @Valid @RequestBody FacilityRequestDTO request) {
        return ApiResponse.success("Facility created successfully", facilityService.createFacility(request));
    }

    @PutMapping("/api/admin/facilities/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FacilityResponseDTO> updateFacility(
            @PathVariable Long id,
            @Valid @RequestBody FacilityRequestDTO request) {
        return ApiResponse.success("Facility updated successfully", facilityService.updateFacility(id, request));
    }

    @DeleteMapping("/api/admin/facilities/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ApiResponse.success("Facility deleted successfully", null);
    }

    @GetMapping("/api/admin/facilities")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<FacilityResponseDTO>> getAllFacilitiesAdmin() {
        return ApiResponse.success("Facilities fetched successfully", facilityService.getAllFacilities());
    }

    @GetMapping("/api/admin/facilities/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FacilityResponseDTO> getFacilityByIdAdmin(@PathVariable Long id) {
        return ApiResponse.success("Facility fetched successfully", facilityService.getFacilityById(id));
    }


    @GetMapping("/api/user/facilities")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<List<FacilityResponseDTO>> getAllFacilitiesResident() {
        return ApiResponse.success("Facilities fetched successfully", facilityService.getAllFacilities());
    }

    @GetMapping("/api/user/facilities/{id}")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<FacilityResponseDTO> getFacilityByIdResident(@PathVariable Long id) {
        return ApiResponse.success("Facility fetched successfully", facilityService.getFacilityById(id));
    }
}
