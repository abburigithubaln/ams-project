package com.arah.apartment_management_system.dto.facility;

import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.FacilityStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityResponseDTO {

    private Long id;
    private String name;
    private String description;
    private FacilityStatus status;
    private String openingTime;
    private String closingTime;
    private Double charges;
    private Integer capacity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
