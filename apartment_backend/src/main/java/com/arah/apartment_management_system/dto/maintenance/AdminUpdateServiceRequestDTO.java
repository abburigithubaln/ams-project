package com.arah.apartment_management_system.dto.maintenance;

import com.arah.apartment_management_system.enums.MaintenanceRequestStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateServiceRequestDTO {
    private String allocatedSlot; // Final timing
    private Long assignedStaffId;
    private MaintenanceRequestStatus status; // Usually ACCEPTED or COMPLETED
}
