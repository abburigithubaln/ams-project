package com.arah.apartment_management_system.mapper;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.block.BlockRequestDTO;
import com.arah.apartment_management_system.dto.block.BlockResponseDTO;
import com.arah.apartment_management_system.entity.Apartment;
import com.arah.apartment_management_system.entity.Block;

@Component
public class BlockMapper {

    public Block toEntity(BlockRequestDTO dto, Apartment apartment) {
        Block block = new Block();
        block.setBlockName(dto.getBlockName());
        block.setApartment(apartment);
        return block;
    }

    public BlockResponseDTO toDTO(Block block) {
        return new BlockResponseDTO(
                block.getId(),
                block.getBlockName(),
                block.getApartment().getId(),
                block.getApartment().getName());
    }
}
