package com.arah.apartment_management_system.dto.security;

import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.VehicleStatus;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleDTO {
    private Long id;
    private String vehicleNumber;
    private String vehicleType;
    private String ownerName;
    private String flatNumber;
    private VehicleStatus status;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
}
