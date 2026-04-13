package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.dto.allotment.*;
import com.arah.apartment_management_system.service.AllotmentService;
import com.arah.apartment_management_system.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/allotments")
@RequiredArgsConstructor
public class AllotmentController {

    private final AllotmentService allotmentService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<AllotmentResponseDTO> createAllotment(
            @Valid @RequestBody AllotmentRequestDTO request) {

        return ApiResponse.success(
                "Allotment created successfully",
                allotmentService.createAllotment(request)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/vacate")
    public ApiResponse<String> vacate(@PathVariable Long id) {

        allotmentService.vacateFlat(id);
        return ApiResponse.success("Flat vacated successfully", null);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/history")
    public ApiResponse<List<AllotmentResponseDTO>> getAllotmentHistory() {
        return ApiResponse.success("History fetched successfully",
                allotmentService.getAllotmentHistory());
    }
}