package com.arah.apartment_management_system.dto.parking;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocateParkingSlotRequest {
    private Long residentId;
    private String vehicleNumber;
    private boolean isExtra;
    private boolean isTemporary;
}
