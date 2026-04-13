package com.arah.apartment_management_system.dto.maintenance;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMaintenanceRequest {
    private Double amount;
    private Integer month;
    private Integer year;
}