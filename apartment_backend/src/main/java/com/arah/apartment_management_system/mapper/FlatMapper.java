package com.arah.apartment_management_system.mapper;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.flat.FlatRequestDTO;
import com.arah.apartment_management_system.dto.flat.FlatResponseDTO;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Block;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.repository.AllotmentRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FlatMapper {

    private final AllotmentRepository allotmentRepository;

    public Flat toEntity(FlatRequestDTO dto, Block block) {

        Flat flat = new Flat();

        flat.setFlatNumber(dto.getFlatNumber());
        flat.setFloorNumber(dto.getFloorNumber());
        flat.setType(dto.getType());
        flat.setUnitSize(dto.getUnitSize());
        flat.setStatus(dto.getStatus());
        flat.setBlock(block);

        return flat;
    }

    public FlatResponseDTO toDTO(Flat flat) {

        FlatResponseDTO dto = new FlatResponseDTO();
        dto.setId(flat.getId());
        dto.setFlatNumber(flat.getFlatNumber());
        dto.setFloorNumber(flat.getFloorNumber());
        dto.setType(flat.getType());
        dto.setStatus(flat.getStatus());
        dto.setBlockId(flat.getBlock().getId());
        dto.setBlockName(flat.getBlock().getBlockName());
        dto.setApartmentName(flat.getBlock().getApartment().getName());
        dto.setApartmentId(flat.getBlock().getApartment().getId());
        dto.setUnitSize(flat.getUnitSize());

        Optional<Allotment> allotment = allotmentRepository
                .findByFlatAndStatus(flat, AllotmentStatus.ACTIVE);
        allotment.ifPresent(a -> {
            dto.setResidentName(a.getUser().getUsername());
            dto.setResidentEmail(a.getUser().getEmail());
        });

        return dto;
    }
}
