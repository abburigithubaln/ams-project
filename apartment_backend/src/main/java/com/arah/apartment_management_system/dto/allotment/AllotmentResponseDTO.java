package com.arah.apartment_management_system.dto.allotment;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AllotmentResponseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String phone;
    private Long flatId;
    private String flatNumber;
    private String blockName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String ownershipStatus;
    private String apartmentName;
}
