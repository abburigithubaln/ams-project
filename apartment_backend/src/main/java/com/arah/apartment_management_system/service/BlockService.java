package com.arah.apartment_management_system.service;

import org.springframework.data.domain.Pageable;
import com.arah.apartment_management_system.dto.block.BlockRequestDTO;
import com.arah.apartment_management_system.dto.block.BlockResponseDTO;
import com.arah.apartment_management_system.dto.block.UpdateBlockRequest;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;

public interface BlockService {

    BlockResponseDTO createBlock(BlockRequestDTO request);

    ApiResponse<PageResponse<BlockResponseDTO>> 
        getAllBlocks(String search, Pageable pageable);

    BlockResponseDTO getBlockById(Long id);

    void deleteBlock(Long id);

	void updateBlock(Long id, UpdateBlockRequest request);
}
