package com.arah.apartment_management_system.mapper;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.apartment.ApartmentRequestDTO;
import com.arah.apartment_management_system.dto.apartment.ApartmentResponseDTO;
import com.arah.apartment_management_system.entity.Apartment;

@Component
public class ApartmentMapper {

    public Apartment toEntity(ApartmentRequestDTO dto) {
        Apartment apartment = new Apartment();
        apartment.setName(dto.getName());
        apartment.setAddress(dto.getAddress());
        return apartment;
    }

    public ApartmentResponseDTO toDTO(Apartment apartment) {
        return new ApartmentResponseDTO(
                apartment.getId(),
                apartment.getName(),
                apartment.getAddress(),
                apartment.getStatus() != null ? apartment.getStatus().name() : "ENABLED");
    }
}
