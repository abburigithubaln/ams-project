package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.facility.FacilityRequestDTO;
import com.arah.apartment_management_system.dto.facility.FacilityResponseDTO;

public interface FacilityService {

    FacilityResponseDTO createFacility(FacilityRequestDTO request);

    FacilityResponseDTO updateFacility(Long id, FacilityRequestDTO request);

    void deleteFacility(Long id);

    List<FacilityResponseDTO> getAllFacilities();

    FacilityResponseDTO getFacilityById(Long id);
}
