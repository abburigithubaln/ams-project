package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.dto.parking.AllocateParkingSlotRequest;
import com.arah.apartment_management_system.dto.parking.CreateParkingSlotRequest;
import com.arah.apartment_management_system.dto.parking.ParkingSlotResponseDTO;
import com.arah.apartment_management_system.service.ParkingService;
import com.arah.apartment_management_system.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/parking/slots")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ParkingController {

    private final ParkingService parkingService;

    @GetMapping
    public ApiResponse<List<ParkingSlotResponseDTO>> getAllSlots() {
        return ApiResponse.success("Slots fetched successfully", parkingService.getAllSlots());
    }

    @PostMapping
    public ApiResponse<ParkingSlotResponseDTO> createSlot(@RequestBody CreateParkingSlotRequest request) {
        return ApiResponse.success("Slot created successfully", parkingService.createSlot(request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteSlot(@PathVariable Long id) {
        parkingService.deleteSlot(id);
        return ApiResponse.success("Slot deleted successfully", null);
    }

    @PostMapping("/{id}/allocate")
    public ApiResponse<ParkingSlotResponseDTO> allocateSlot(@PathVariable Long id, @RequestBody AllocateParkingSlotRequest request) {
        return ApiResponse.success("Slot allocated successfully", parkingService.allocateSlot(id, request));
    }

    @PostMapping("/{id}/deallocate")
    public ApiResponse<String> deallocateSlot(@PathVariable Long id) {
        parkingService.deallocateSlot(id);
        return ApiResponse.success("Slot deallocated successfully", null);
    }
}
