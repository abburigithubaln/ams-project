package com.arah.apartment_management_system.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.clubhouse.ClubhouseBookingRequest;
import com.arah.apartment_management_system.dto.clubhouse.ClubhouseBookingResponse;
import com.arah.apartment_management_system.enums.BookingStatus;
import com.arah.apartment_management_system.service.ClubhouseBookingService;
import com.arah.apartment_management_system.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ClubhouseBookingController {

    private final ClubhouseBookingService clubhouseBookingService;


    @GetMapping("/api/admin/clubhouse/capacity")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Integer> getClubhouseCapacity() {
        return ApiResponse.success("Fetched capacity", clubhouseBookingService.getMaxCapacity());
    }

    @PutMapping("/api/admin/clubhouse/capacity")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Integer> setClubhouseCapacity(@RequestBody Map<String, Integer> request) {
        Integer newLimit = request.get("capacity");
        if (newLimit == null) {
            throw new IllegalArgumentException("Capacity is required");
        }
        return ApiResponse.success("Capacity updated", clubhouseBookingService.setMaxCapacity(newLimit));
    }

    @GetMapping("/api/admin/clubhouse")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ClubhouseBookingResponse>> getAllBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ApiResponse.success("Clubhouse bookings fetched successfully", clubhouseBookingService.getAllBookings(startDate, endDate));
    }

    @PutMapping("/api/admin/clubhouse/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ClubhouseBookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        return ApiResponse.success("Booking status updated", clubhouseBookingService.updateStatus(id, status));
    }

    @PostMapping("/api/admin/clubhouse")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ClubhouseBookingResponse> adminCreateBooking(
            @Valid @RequestBody ClubhouseBookingRequest request) {
        return ApiResponse.success("Clubhouse booked successfully (Admin)",
                clubhouseBookingService.createBooking(request));
    }

    @DeleteMapping("/api/admin/clubhouse/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteBooking(@PathVariable Long id) {
        clubhouseBookingService.deleteBooking(id);
        return ApiResponse.success("Booking deleted successfully", null);
    }

    @PutMapping("/api/admin/clubhouse/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ClubhouseBookingResponse> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody ClubhouseBookingRequest request) {
        return ApiResponse.success("Booking updated successfully",
                clubhouseBookingService.updateBooking(id, request));
    }


    @GetMapping("/api/user/clubhouse")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<List<ClubhouseBookingResponse>> getMyBookings() {
        return ApiResponse.success("Bookings fetched", clubhouseBookingService.getMyBookings());
    }

    @PostMapping("/api/user/clubhouse")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<ClubhouseBookingResponse> createBooking(
            @Valid @RequestBody ClubhouseBookingRequest request) {
        return ApiResponse.success("Clubhouse booked successfully", clubhouseBookingService.createBooking(request));
    }

    @PutMapping("/api/user/clubhouse/{id}")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<ClubhouseBookingResponse> userUpdateBooking(
            @PathVariable Long id,
            @Valid @RequestBody ClubhouseBookingRequest request) {
        return ApiResponse.success("Booking updated successfully",
                clubhouseBookingService.updateBooking(id, request));
    }
}
