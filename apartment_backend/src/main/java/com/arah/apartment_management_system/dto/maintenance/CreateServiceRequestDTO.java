package com.arah.apartment_management_system.dto.maintenance;

import com.arah.apartment_management_system.enums.MaintenanceServiceType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateServiceRequestDTO {
    private Long flatId;
    private MaintenanceServiceType serviceType;
    private String description;
    private String preferredSlot; // Timing when resident is available
}
