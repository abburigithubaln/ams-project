package com.arah.apartment_management_system.dto.parking;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlotResponseDTO {
    private Long id;
    private String slotNumber;
    private String type;
    private String status;
    private Long residentId;
    private String residentName;
    private String flatNumber;
    private String vehicleNumber;
    private boolean isExtra;
    private boolean isTemporary;
    private LocalDateTime allocatedAt;
}
