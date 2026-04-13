package com.arah.apartment_management_system.mapper;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.facility.FacilityResponseDTO;
import com.arah.apartment_management_system.entity.Facility;

@Component
public class FacilityMapper {

    public FacilityResponseDTO toDTO(Facility facility) {

        return FacilityResponseDTO.builder()
                .id(facility.getId())
                .name(facility.getName())
                .description(facility.getDescription())
                .status(facility.getStatus())
                .openingTime(facility.getOpeningTime())
                .closingTime(facility.getClosingTime())
                .charges(facility.getCharges())
                .capacity(facility.getCapacity())
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .build();
    }
}
