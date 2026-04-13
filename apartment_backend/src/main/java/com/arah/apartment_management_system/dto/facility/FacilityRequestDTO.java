package com.arah.apartment_management_system.dto.facility;

import com.arah.apartment_management_system.enums.FacilityStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityRequestDTO {

    @NotBlank(message = "Facility name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    private FacilityStatus status;

    private String openingTime;

    private String closingTime;

    @NotNull(message = "Charges are required")
    @Min(value = 0, message = "Charges cannot be negative")
    private Double charges;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
}
