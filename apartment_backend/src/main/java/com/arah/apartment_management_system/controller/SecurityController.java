package com.arah.apartment_management_system.controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.security.ParcelDTO;
import com.arah.apartment_management_system.dto.security.VehicleDTO;
import com.arah.apartment_management_system.dto.security.VisitorDTO;
import com.arah.apartment_management_system.dto.user.ChangePasswordRequest;
import com.arah.apartment_management_system.dto.user.UpdateUserRequest;
import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.entity.Notice;
import com.arah.apartment_management_system.entity.Parcel;
import com.arah.apartment_management_system.entity.Vehicle;
import com.arah.apartment_management_system.entity.Visitor;
import com.arah.apartment_management_system.enums.ParcelStatus;
import com.arah.apartment_management_system.enums.VehicleStatus;
import com.arah.apartment_management_system.enums.VisitorStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.mapper.SecurityMapper;
import com.arah.apartment_management_system.repository.ParcelRepository;
import com.arah.apartment_management_system.repository.VehicleRepository;
import com.arah.apartment_management_system.repository.VisitorRepository;
import com.arah.apartment_management_system.service.NoticeService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.util.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SECURITY')")
public class SecurityController {

    private final UserService userService;
    private final VisitorRepository visitorRepository;
    private final ParcelRepository parcelRepository;
    private final VehicleRepository vehicleRepository;
    private final SecurityMapper securityMapper;
    private final NoticeService noticeService;

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfile() {
        return ApiResponse.success("Profile fetched", userService.getLoggedInUserProfile());
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

    @GetMapping("/notices")
    public ApiResponse<List<Notice>> getNotices() {
        return ApiResponse.success("Notices fetched successfully", noticeService.getAllNotices());
    }

    @GetMapping("/visitors")
    public ApiResponse<List<VisitorDTO>> getAllVisitors() {
        Long aptId = userService.getLoggedInUser().getManagedApartment() != null
                ? userService.getLoggedInUser().getManagedApartment().getId()
                : null;
        List<Visitor> visitorList = aptId != null ? visitorRepository.findByApartmentId(aptId) : List.of();
        List<VisitorDTO> visitors = visitorList
                .stream()
                .sorted(Comparator.comparing(Visitor::getEntryTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(securityMapper::toVisitorDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Visitors fetched", visitors);
    }

    @PostMapping("/visitors")
    public ApiResponse<VisitorDTO> checkInVisitor(@RequestBody VisitorDTO request) {
        Visitor visitor = new Visitor();
        visitor.setName(request.getName());
        visitor.setPhone(request.getPhone());
        visitor.setFlatNumber(request.getFlatNumber());
        visitor.setPurpose(request.getPurpose());
        visitor.setStatus(VisitorStatus.CHECKED_IN);
        visitor.setEntryTime(LocalDateTime.now());
        if (userService.getLoggedInUser().getManagedApartment() != null) {
            visitor.setApartment(userService.getLoggedInUser().getManagedApartment());
        }
        return ApiResponse.success("Visitor checked in", securityMapper.toVisitorDTO(visitorRepository.save(visitor)));
    }

    @PostMapping("/visitors/check-in-otp")
    public ApiResponse<VisitorDTO> checkInWithOtp(@RequestParam String otp) {
        Visitor visitor = visitorRepository.findByOtp(otp)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid OTP"));

        if (visitor.getStatus() != VisitorStatus.PRE_APPROVED) {
            return ApiResponse.<VisitorDTO>error("OTP already used or visitor already checked in");
        }

        com.arah.apartment_management_system.entity.Apartment secApt = userService.getLoggedInUser()
                .getManagedApartment();
        if (secApt != null && visitor.getApartment() != null
                && !secApt.getId().equals(visitor.getApartment().getId())) {
            return ApiResponse.<VisitorDTO>error("Visitor does not belong to your apartment.");
        }

        visitor.setStatus(VisitorStatus.CHECKED_IN);
        visitor.setEntryTime(LocalDateTime.now());
        return ApiResponse.success("Visitor checked in with OTP",
                securityMapper.toVisitorDTO(visitorRepository.save(visitor)));
    }

    @PutMapping("/visitors/{id}/checkout")
    public ApiResponse<VisitorDTO> checkOutVisitor(@PathVariable Long id) {
        Visitor visitor = visitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor not found"));

        com.arah.apartment_management_system.entity.Apartment secApt = userService.getLoggedInUser()
                .getManagedApartment();
        if (secApt != null && visitor.getApartment() != null
                && !secApt.getId().equals(visitor.getApartment().getId())) {
            throw new RuntimeException("Unauthorized: This visitor does not belong to your apartment.");
        }

        visitor.setStatus(VisitorStatus.CHECKED_OUT);
        visitor.setExitTime(LocalDateTime.now());
        return ApiResponse.success("Visitor checked out", securityMapper.toVisitorDTO(visitorRepository.save(visitor)));
    }

    @GetMapping("/parcels")
    public ApiResponse<List<ParcelDTO>> getAllParcels() {
        Long aptId = userService.getLoggedInUser().getManagedApartment() != null
                ? userService.getLoggedInUser().getManagedApartment().getId()
                : null;
        List<Parcel> parcelList = aptId != null ? parcelRepository.findByApartmentId(aptId) : List.of();
        List<ParcelDTO> parcels = parcelList
                .stream()
                .sorted(Comparator.comparing(Parcel::getReceivedTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(securityMapper::toParcelDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Parcels fetched", parcels);
    }

    @PostMapping("/parcels")
    public ApiResponse<ParcelDTO> registerParcel(@RequestBody ParcelDTO request) {
        Parcel parcel = new Parcel();
        parcel.setRecipientName(request.getRecipientName());
        parcel.setFlatNumber(request.getFlatNumber());
        parcel.setCourier(request.getCourier());
        parcel.setTrackingNumber(request.getTrackingNumber());
        parcel.setStatus(ParcelStatus.PENDING);
        parcel.setReceivedTime(LocalDateTime.now());
        if (userService.getLoggedInUser().getManagedApartment() != null) {
            parcel.setApartment(userService.getLoggedInUser().getManagedApartment());
        }
        return ApiResponse.success("Parcel registered", securityMapper.toParcelDTO(parcelRepository.save(parcel)));
    }

    @PutMapping("/parcels/{id}/collect")
    public ApiResponse<ParcelDTO> markParcelCollected(@PathVariable Long id) {
        Parcel parcel = parcelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parcel not found"));

        com.arah.apartment_management_system.entity.Apartment secApt = userService.getLoggedInUser()
                .getManagedApartment();
        if (secApt != null && parcel.getApartment() != null
                && !secApt.getId().equals(parcel.getApartment().getId())) {
            throw new RuntimeException("Unauthorized: This parcel does not belong to your apartment.");
        }

        parcel.setStatus(ParcelStatus.COLLECTED);
        parcel.setCollectedTime(LocalDateTime.now());
        return ApiResponse.success("Parcel marked as collected",
                securityMapper.toParcelDTO(parcelRepository.save(parcel)));
    }

    @GetMapping("/vehicles")
    public ApiResponse<List<VehicleDTO>> getAllVehicles() {
        Long aptId = userService.getLoggedInUser().getManagedApartment() != null
                ? userService.getLoggedInUser().getManagedApartment().getId()
                : null;
        List<Vehicle> vehicleList = aptId != null ? vehicleRepository.findByApartmentId(aptId) : List.of();
        List<VehicleDTO> vehicles = vehicleList
                .stream()
                .sorted(Comparator.comparing(Vehicle::getEntryTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(securityMapper::toVehicleDTO)
                .collect(Collectors.toList());
        return ApiResponse.success("Vehicles fetched", vehicles);
    }

    @PostMapping("/vehicles")
    public ApiResponse<VehicleDTO> recordVehicleEntry(@RequestBody VehicleDTO request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setOwnerName(request.getOwnerName());
        vehicle.setFlatNumber(request.getFlatNumber());
        vehicle.setStatus(VehicleStatus.PARKED);
        vehicle.setEntryTime(LocalDateTime.now());
        if (userService.getLoggedInUser().getManagedApartment() != null) {
            vehicle.setApartment(userService.getLoggedInUser().getManagedApartment());
        }
        return ApiResponse.success("Vehicle entry recorded",
                securityMapper.toVehicleDTO(vehicleRepository.save(vehicle)));
    }

    @PutMapping("/vehicles/{id}/exit")
    public ApiResponse<VehicleDTO> recordVehicleExit(@PathVariable Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        com.arah.apartment_management_system.entity.Apartment secApt = userService.getLoggedInUser()
                .getManagedApartment();
        if (secApt != null && vehicle.getApartment() != null
                && !secApt.getId().equals(vehicle.getApartment().getId())) {
            throw new RuntimeException("Unauthorized: This vehicle does not belong to your apartment.");
        }

        vehicle.setStatus(VehicleStatus.EXITED);
        vehicle.setExitTime(LocalDateTime.now());
        return ApiResponse.success("Vehicle exit recorded",
                securityMapper.toVehicleDTO(vehicleRepository.save(vehicle)));
    }
}
