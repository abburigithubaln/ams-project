package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.enums.PaymentMethod;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.flat.FlatResponseDTO;
import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.ChangePasswordRequest;
import com.arah.apartment_management_system.dto.notice.NoticeResponseDTO;
import com.arah.apartment_management_system.dto.notice.NoticeResponseRequest;
import com.arah.apartment_management_system.dto.parking.ParkingSlotResponseDTO;
import com.arah.apartment_management_system.dto.staff.StaffResponse;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.service.AdminService;
import com.arah.apartment_management_system.service.FlatService;
import com.arah.apartment_management_system.service.MaintenanceService;
import com.arah.apartment_management_system.service.NoticeService;
import com.arah.apartment_management_system.service.ParkingService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.entity.Notice;
import com.arah.apartment_management_system.dto.security.ParcelDTO;
import com.arah.apartment_management_system.dto.security.VisitorDTO;
import com.arah.apartment_management_system.entity.Visitor;
import com.arah.apartment_management_system.entity.Parcel;
import com.arah.apartment_management_system.enums.VisitorStatus;
import com.arah.apartment_management_system.repository.ParcelRepository;
import com.arah.apartment_management_system.repository.VisitorRepository;
import com.arah.apartment_management_system.mapper.SecurityMapper;
import com.arah.apartment_management_system.util.ApiResponse;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESIDENT')")
public class UserController {

    private final FlatService flatService;
    private final UserService userService;
    private final MaintenanceService maintenanceService;
    private final NoticeService noticeService;
    private final AdminService adminService;
    private final ParkingService parkingService;
    private final VisitorRepository visitorRepository;
    private final ParcelRepository parcelRepository;
    private final SecurityMapper securityMapper;

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getMyProfile() {
        return ApiResponse.success("Profile fetched successfully", userService.getLoggedInUserProfile());
    }

    @PutMapping("/profile")
    public ApiResponse<String> updateProfile(@RequestBody UpdateUserRequest request) {
        String username = userService.getLoggedInUser().getUsername();
        userService.updateProfile(username, request);
        return ApiResponse.success("Profile updated successfully", null);
    }

    @PutMapping("/change-password")
    public ApiResponse<String> changePassword(
            Principal principal,
            @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getName(), request);
        return ApiResponse.success("Password changed successfully", null);
    }

    @GetMapping("/flat")
    public ApiResponse<FlatResponseDTO> getMyFlat() {
        return ApiResponse.success("Flat fetched successfully", flatService.getMyFlat());
    }

    @GetMapping("/maintenance")
    public ApiResponse<List<MaintenanceResponseDTO>> getMyMaintenance() {
        return ApiResponse.success("Maintenance fetched successfully", maintenanceService.getMyMaintenance());
    }

    @PutMapping("/maintenance/{id}/mark-paid")
    public ApiResponse<MaintenanceResponseDTO> markMaintenanceAsPaid(
            @PathVariable Long id,
            @RequestParam PaymentMethod paymentMethod,
            @RequestParam(required = false) String receiptUrl) {
        return ApiResponse.success("Maintenance marked as PAID",
                maintenanceService.markAsPaid(id, paymentMethod, receiptUrl));
    }

    @GetMapping("/notices")
    public ApiResponse<List<Notice>> getNotices(Principal principal) {
        return ApiResponse.success("Notices fetched successfully", noticeService.getAllNotices(principal.getName()));
    }

    @PostMapping("/notices/{id}/rsvp")
    public ApiResponse<String> rsvpForEvent(@PathVariable Long id, Principal principal) {
        noticeService.rsvpForEvent(id, principal.getName());
        return ApiResponse.success("RSVP updated", null);
    }

    @GetMapping("/notices/{id}/rsvp-count")
    public ApiResponse<Long> getRsvpCount(@PathVariable Long id) {
        return ApiResponse.success("RSVP count fetched", noticeService.getRsvpCount(id));
    }

    @GetMapping("/notices/{id}/responses")
    public ApiResponse<List<NoticeResponseDTO>> getNoticeResponses(@PathVariable Long id) {
        return ApiResponse.success("Responses fetched", noticeService.getNoticeResponses(id));
    }

    @PostMapping("/notices/{id}/responses")
    public ApiResponse<String> addNoticeResponse(
            @PathVariable Long id,
            @RequestBody NoticeResponseRequest request,
            Principal principal) {
        noticeService.addNoticeResponse(id, request.getResponseText(), principal.getName());
        return ApiResponse.success("Response added successfully", null);
    }

    @GetMapping("/staff")
    public ApiResponse<List<StaffResponse>> getStaffList() {
        return ApiResponse.success("Staff list fetched successfully", adminService.getStaffByApartmentForCurrentUser());
    }

    @GetMapping("/parking/my-slots")
    public ApiResponse<List<ParkingSlotResponseDTO>> getMyParkingSlots() {
        return ApiResponse.success("My parking slots fetched successfully", parkingService.getMySlots());
    }

    @GetMapping("/visitors")
    public ApiResponse<List<VisitorDTO>> getMyVisitorHistory() {
        FlatResponseDTO myFlat;
        try {
            myFlat = flatService.getMyFlat();
        } catch (Exception e) {
            return ApiResponse.success("No active flat assigned, showing empty history", List.of());
        }

        String flatNum = myFlat.getFlatNumber();
        Long apartmentId = myFlat.getApartmentId();

        List<Visitor> visitorList = visitorRepository.findByFlatNumberAndApartmentId(flatNum, apartmentId);
        List<VisitorDTO> history = visitorList.stream()
                .map(securityMapper::toVisitorDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Visitor history fetched", history);
    }

    @PostMapping("/visitors/pre-approve")
    public ApiResponse<VisitorDTO> preApproveVisitor(@RequestBody VisitorDTO request) {
        FlatResponseDTO myFlat;
        try {
            myFlat = flatService.getMyFlat();
        } catch (Exception e) {
            return ApiResponse.<VisitorDTO>error("You must have an active flat allotment to pre-approve visitors.");
        }

        String flatNumber = myFlat.getFlatNumber();
        Visitor visitor = new Visitor();
        visitor.setName(request.getName());
        visitor.setPhone(request.getPhone());
        visitor.setFlatNumber(flatNumber);
        visitor.setPurpose(request.getPurpose());
        visitor.setStatus(VisitorStatus.PRE_APPROVED);
        visitor.setPreApproved(true);

        // Generate a 6-digit OTP
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        visitor.setOtp(otp);

        // Fetch the apartment from the flat
        if (myFlat.getApartmentId() != null) {
            com.arah.apartment_management_system.entity.Apartment apt = new com.arah.apartment_management_system.entity.Apartment();
            apt.setId(myFlat.getApartmentId());
            visitor.setApartment(apt);
        }

        return ApiResponse.success("Visitor pre-approved. OTP: " + otp,
                securityMapper.toVisitorDTO(visitorRepository.save(visitor)));
    }

    @GetMapping("/parcels")
    public ApiResponse<List<ParcelDTO>> getMyParcels() {
        FlatResponseDTO myFlat;
        try {
            myFlat = flatService.getMyFlat();
        } catch (Exception e) {
            return ApiResponse.success("No active flat assigned, showing empty history", List.of());
        }

        String flatNum = myFlat.getFlatNumber();
        Long apartmentId = myFlat.getApartmentId();

        List<Parcel> parcelList = parcelRepository.findByFlatNumberAndApartmentId(flatNum, apartmentId);
        List<ParcelDTO> parcelDTOs = parcelList.stream()
                .map(securityMapper::toParcelDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Parcels fetched", parcelDTOs);
    }
}