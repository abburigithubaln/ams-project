package com.arah.apartment_management_system.dto.block;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlockRequestDTO {

    @NotBlank(message = "Block name is required")
    private String blockName;

    @NotNull(message = "Apartment ID is required")
    private Long apartmentId;
}

