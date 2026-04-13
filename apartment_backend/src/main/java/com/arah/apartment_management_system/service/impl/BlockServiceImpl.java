package com.arah.apartment_management_system.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.block.BlockRequestDTO;
import com.arah.apartment_management_system.dto.block.BlockResponseDTO;
import com.arah.apartment_management_system.dto.block.UpdateBlockRequest;
import com.arah.apartment_management_system.entity.Apartment;
import com.arah.apartment_management_system.entity.Block;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.ApartmentRepository;
import com.arah.apartment_management_system.repository.BlockRepository;
import com.arah.apartment_management_system.service.BlockService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;
import com.arah.apartment_management_system.mapper.BlockMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlockServiceImpl implements BlockService {

    private final BlockRepository blockRepository;
    private final ApartmentRepository apartmentRepository;
    private final BlockMapper blockMapper;
    private final com.arah.apartment_management_system.service.UserService userService;

    @Override
    public BlockResponseDTO createBlock(BlockRequestDTO request) {
        com.arah.apartment_management_system.entity.User admin = userService.getLoggedInUser();
        Long apartmentId = request.getApartmentId();

        if (admin.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            if (admin.getManagedApartment() == null) {
                throw new RuntimeException("Admin has no assigned apartment");
            }
            apartmentId = admin.getManagedApartment().getId();
        }

        if (apartmentId == null) {
            throw new ResourceNotFoundException("Apartment ID missing");
        }

        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));

        Block block = blockMapper.toEntity(request, apartment);
        Block saved = blockRepository.save(block);
        return blockMapper.toDTO(saved);
    }

    @Override
    public ApiResponse<PageResponse<BlockResponseDTO>> getAllBlocks(String search, Pageable pageable) {
        com.arah.apartment_management_system.entity.User contextUser = userService.getLoggedInUser();
        Page<Block> blocks;

        if (contextUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            if (search != null && !search.isBlank()) {
                blocks = blockRepository.findByBlockNameContainingIgnoreCase(search, pageable);
            } else {
                blocks = blockRepository.findAll(pageable);
            }
        } else {
            Long apartmentId = null;
            if (contextUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_ADMIN || contextUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SECURITY) {
                apartmentId = contextUser.getManagedApartment() != null ? contextUser.getManagedApartment().getId() : null;
            } else if (contextUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_RESIDENT) {
                apartmentId = contextUser.getAllotments().stream()
                        .findFirst()
                        .map(a -> a.getFlat().getBlock().getApartment().getId())
                        .orElse(null);
            }

            if (apartmentId != null) {
                blocks = blockRepository.findByApartmentId(apartmentId, pageable);
            } else {
                blocks = Page.empty(pageable);
            }
        }

        Page<BlockResponseDTO> dtoPage = blocks.map(blockMapper::toDTO);

        PageResponse<BlockResponseDTO> pageResponse = new PageResponse<>(
                dtoPage.getContent(),
                dtoPage.getNumber(),
                dtoPage.getSize(),
                dtoPage.getTotalElements(),
                dtoPage.getTotalPages(),
                dtoPage.isLast());

        return ApiResponse.success("Blocks fetched successfully", pageResponse);
    }

    @Override
    public BlockResponseDTO getBlockById(Long id) {
        if (id == null) throw new ResourceNotFoundException("Id cannot be null");
        Block block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));

        return blockMapper.toDTO(block);
    }

    @Override
    public void deleteBlock(Long id) {
        if (id == null) throw new ResourceNotFoundException("Id cannot be null");
        com.arah.apartment_management_system.entity.User admin = userService.getLoggedInUser();
        Block block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));

        if (admin.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN && 
            (block.getApartment() == null || !block.getApartment().getId().equals(admin.getManagedApartment().getId()))) {
            throw new RuntimeException("Unauthorized to delete this block");
        }

        blockRepository.delete(block);
    }

    @Override
    public void updateBlock(Long id, UpdateBlockRequest request) {
        if (id == null) throw new ResourceNotFoundException("Id cannot be null");
        com.arah.apartment_management_system.entity.User admin = userService.getLoggedInUser();
        Block block = blockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));

        if (admin.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN && 
            (block.getApartment() == null || !block.getApartment().getId().equals(admin.getManagedApartment().getId()))) {
            throw new RuntimeException("Unauthorized to update this block");
        }

        block.setBlockName(request.getBlockName());
        blockRepository.save(block);
    }
}
