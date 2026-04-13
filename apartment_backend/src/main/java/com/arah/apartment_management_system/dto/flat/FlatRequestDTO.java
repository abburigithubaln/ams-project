package com.arah.apartment_management_system.dto.flat;

import com.arah.apartment_management_system.enums.FlatStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FlatRequestDTO {

    @NotBlank(message = "Flat number is required")
    private String flatNumber;

    @NotNull(message = "floor number is required")
    private Integer floorNumber;

    @NotBlank(message = "type is required")
    private String type;

    private String unitSize;

    @NotNull
    private FlatStatus status;

    @NotNull(message = "Block ID is required")
    private Long blockId;
}
