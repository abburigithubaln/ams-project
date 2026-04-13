package com.arah.apartment_management_system.dto.apartment;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApartmentRequestDTO {

    @NotBlank(message = "Apartment name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;
}
