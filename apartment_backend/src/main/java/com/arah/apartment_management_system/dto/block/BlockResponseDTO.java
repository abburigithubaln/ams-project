package com.arah.apartment_management_system.dto.block;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlockResponseDTO {

    private Long id;
    private String blockName;
    private Long apartmentId;
    private String apartmentName;
}
