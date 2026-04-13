package com.arah.apartment_management_system.dto.maintenance;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateMaintenanceRequest {
    private Long flatId;
    private Double amount;
    private int month;
    private int year;
}
