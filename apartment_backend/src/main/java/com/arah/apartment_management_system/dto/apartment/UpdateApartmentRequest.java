package com.arah.apartment_management_system.dto.apartment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateApartmentRequest {
    private String name;
    private String address;
}