package com.arah.apartment_management_system.dto.parking;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateParkingSlotRequest {
    private String slotNumber;
    private String type;
}
