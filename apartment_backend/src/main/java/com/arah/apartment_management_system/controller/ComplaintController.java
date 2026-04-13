package com.arah.apartment_management_system.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.complaint.ComplaintResponseDTO;
import com.arah.apartment_management_system.dto.complaint.CreateComplaintRequest;
import com.arah.apartment_management_system.enums.ComplaintStatus;
import com.arah.apartment_management_system.service.ComplaintService;
import com.arah.apartment_management_system.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;


    @GetMapping("/api/admin/complaints")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ComplaintResponseDTO>> getAllComplaints() {
        return ApiResponse.success("Complaints fetched successfully", complaintService.getAllComplaints());
    }

    @PutMapping("/api/admin/complaints/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ComplaintResponseDTO> updateComplaintStatus(
            @PathVariable Long id,
            @RequestParam ComplaintStatus status) {
        return ApiResponse.success("Status updated", complaintService.updateStatus(id, status));
    }

    @PutMapping("/api/admin/complaints/{id}/assign-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ComplaintResponseDTO> assignStaff(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        return ApiResponse.success("Staff assigned successfully", complaintService.assignStaff(id, staffId));
    }

    @DeleteMapping("/api/admin/complaints/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ApiResponse.success("Complaint deleted", null);
    }


    @GetMapping("/api/user/complaints")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<List<ComplaintResponseDTO>> getMyComplaints() {
        return ApiResponse.success("Complaints fetched", complaintService.getMyComplaints());
    }

    @PostMapping("/api/user/complaints")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<ComplaintResponseDTO> createComplaint(
            @Valid @RequestBody CreateComplaintRequest request) {
        return ApiResponse.success("Complaint submitted successfully", complaintService.createComplaint(request));
    }
}
