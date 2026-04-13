package com.arah.apartment_management_system.service.impl;

import com.arah.apartment_management_system.dto.maintenance.AdminUpdateServiceRequestDTO;
import com.arah.apartment_management_system.dto.maintenance.CreateServiceRequestDTO;
import com.arah.apartment_management_system.dto.maintenance.MaintenanceServiceResponseDTO;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.MaintenanceServiceRequest;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.MaintenanceRequestStatus;
import com.arah.apartment_management_system.enums.MaintenanceServiceType;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.MaintenanceServiceRequestRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.service.MaintenanceRequestService;
import com.arah.apartment_management_system.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceRequestServiceImpl implements MaintenanceRequestService {

    private final MaintenanceServiceRequestRepository repository;
    private final AllotmentRepository allotmentRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    private static final Map<MaintenanceServiceType, Double> BASIC_CHARGES = new HashMap<>();

    static {
        BASIC_CHARGES.put(MaintenanceServiceType.PLUMBER, 200.0);
        BASIC_CHARGES.put(MaintenanceServiceType.ELECTRICIAN, 250.0);
        BASIC_CHARGES.put(MaintenanceServiceType.HOUSEKEEPING, 150.0);
        BASIC_CHARGES.put(MaintenanceServiceType.PEST_CONTROL, 500.0);
        BASIC_CHARGES.put(MaintenanceServiceType.OTHERS, 0.0);
    }

    @Override
    public MaintenanceServiceResponseDTO raiseRequest(CreateServiceRequestDTO requestDTO, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Flat flat = allotmentRepository.findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                .map(Allotment::getFlat)
                .orElseThrow(() -> new ResourceNotFoundException("No active flat found for this user"));

        MaintenanceServiceRequest request = MaintenanceServiceRequest.builder()
                .serviceType(requestDTO.getServiceType())
                .description(requestDTO.getDescription())
                .basicCharges(BASIC_CHARGES.getOrDefault(requestDTO.getServiceType(), 0.0))
                .status(MaintenanceRequestStatus.PENDING)
                .preferredSlot(requestDTO.getPreferredSlot())
                .user(user)
                .flat(flat)
                .build();

        return mapToDTO(repository.save(request));
    }

    @Override
    public List<MaintenanceServiceResponseDTO> getResidentRequests(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void cancelRequest(Long requestId, Long userId) {
        MaintenanceServiceRequest request = repository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (!request.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this request");
        }

        if (request.getStatus() == MaintenanceRequestStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed request");
        }

        request.setStatus(MaintenanceRequestStatus.CANCELLED);
        repository.save(request);
    }

    @Override
    public List<MaintenanceServiceResponseDTO> getAllRequests() {
        User user = userService.getLoggedInUser();
        List<MaintenanceServiceRequest> requests;

        if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            requests = repository.findAllByOrderByCreatedAtDesc();
        } else if (user.getManagedApartment() != null) {
            requests = repository.findByApartmentIdOrderByCreatedAtDesc(user.getManagedApartment().getId());
        } else {
            requests = List.of();
        }

        return requests.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MaintenanceServiceResponseDTO updateByAdmin(Long requestId, AdminUpdateServiceRequestDTO updateDTO) {
        MaintenanceServiceRequest request = repository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (updateDTO.getStatus() != null) {
            request.setStatus(updateDTO.getStatus());
            if (updateDTO.getStatus() == MaintenanceRequestStatus.COMPLETED) {
                request.setCompletedAt(LocalDateTime.now());
            }
        }

        if (updateDTO.getAllocatedSlot() != null) {
            request.setAllocatedSlot(updateDTO.getAllocatedSlot());
        }

        if (updateDTO.getAssignedStaffId() != null) {
            User staff = userRepository.findById(updateDTO.getAssignedStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
            request.setAssignedStaff(staff);
        }

        return mapToDTO(repository.save(request));
    }

    @Override
    public void deleteRequest(Long requestId) {
        repository.deleteById(requestId);
    }

    @Override
    public Map<String, Double> getBasicCharges() {
        Map<String, Double> charges = new HashMap<>();
        for (Map.Entry<MaintenanceServiceType, Double> entry : BASIC_CHARGES.entrySet()) {
            charges.put(entry.getKey().name(), entry.getValue());
        }
        return charges;
    }

    private MaintenanceServiceResponseDTO mapToDTO(MaintenanceServiceRequest request) {
        return MaintenanceServiceResponseDTO.builder()
                .id(request.getId())
                .flatId(request.getFlat() != null ? request.getFlat().getId() : null)
                .flatNumber(request.getFlat() != null ? request.getFlat().getFlatNumber() : "N/A")
                .residentName(request.getUser().getUsername())
                .serviceType(request.getServiceType())
                .description(request.getDescription())
                .basicCharges(request.getBasicCharges())
                .status(request.getStatus())
                .preferredSlot(request.getPreferredSlot())
                .allocatedSlot(request.getAllocatedSlot())
                .assignedStaffName(request.getAssignedStaff() != null ? request.getAssignedStaff().getUsername() : null)
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .completedAt(request.getCompletedAt())
                .build();
    }
}
