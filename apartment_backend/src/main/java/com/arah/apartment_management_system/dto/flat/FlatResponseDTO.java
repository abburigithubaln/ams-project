package com.arah.apartment_management_system.dto.flat;

import com.arah.apartment_management_system.enums.FlatStatus;
import com.arah.apartment_management_system.enums.OwnershipStatus;
import java.time.LocalDate;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FlatResponseDTO {

    private Long id;
    private String flatNumber;
    private Integer floorNumber;
    private String type;
    private FlatStatus status;
    private Long blockId;
    private String blockName;
    private String apartmentName;
    private Long apartmentId;
    private String unitSize;
    private OwnershipStatus ownershipStatus;
    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private String residentName;
    private String residentEmail;
}
