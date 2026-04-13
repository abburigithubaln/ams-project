package com.arah.apartment_management_system.service;

import org.springframework.data.domain.Pageable;
import com.arah.apartment_management_system.dto.flat.FlatRequestDTO;
import com.arah.apartment_management_system.dto.flat.FlatResponseDTO;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;


public interface FlatService {

    FlatResponseDTO createFlat(FlatRequestDTO request);

    ApiResponse<PageResponse<FlatResponseDTO>>
        getAllFlats(String search, Pageable pageable);

    FlatResponseDTO getFlatById(Long id);

    FlatResponseDTO updateFlat(Long id, FlatRequestDTO request);

    void deleteFlat(Long id);

	FlatResponseDTO getMyFlat();
}
