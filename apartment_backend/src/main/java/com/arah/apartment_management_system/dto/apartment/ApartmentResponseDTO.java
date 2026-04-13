package com.arah.apartment_management_system.dto.apartment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApartmentResponseDTO {

    private Long id;
    private String name;
    private String address;
    private String status;
}
