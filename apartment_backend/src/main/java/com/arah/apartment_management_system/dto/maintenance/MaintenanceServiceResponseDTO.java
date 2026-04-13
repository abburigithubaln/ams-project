package com.arah.apartment_management_system.dto.maintenance;

import com.arah.apartment_management_system.enums.MaintenanceRequestStatus;
import com.arah.apartment_management_system.enums.MaintenanceServiceType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class MaintenanceServiceResponseDTO {
    private Long id;
    private Long flatId;
    private String flatNumber;
    private String residentName;
    private MaintenanceServiceType serviceType;
    private String description;
    private Double basicCharges;
    private MaintenanceRequestStatus status;
    private String preferredSlot;
    private String allocatedSlot;
    private String assignedStaffName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
