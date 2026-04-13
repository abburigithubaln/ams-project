package com.arah.apartment_management_system.service.impl;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.flat.FlatRequestDTO;
import com.arah.apartment_management_system.dto.flat.FlatResponseDTO;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Block;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.BlockRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.security.CustomUserDetails;
import com.arah.apartment_management_system.service.FlatService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;
import com.arah.apartment_management_system.mapper.FlatMapper;

@Service
@RequiredArgsConstructor
@Transactional
public class FlatServiceImpl implements FlatService {

    private final FlatRepository flatRepository;
    private final BlockRepository blockRepository;
    private final AllotmentRepository allotmentRepository;
    private final UserService userService;
    private final FlatMapper flatMapper;

    @Override
    public FlatResponseDTO createFlat(FlatRequestDTO request) {

        Block block = blockRepository.findById(request.getBlockId())
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));

        Flat flat = flatMapper.toEntity(request, block);

        return flatMapper.toDTO(flatRepository.save(flat));
    }

    @Override
    public ApiResponse<PageResponse<FlatResponseDTO>> getAllFlats(String search, Pageable pageable) {

        User user = getLoggedInUser();
        Page<Flat> flats;

        if (user.getRole() == Role.ROLE_RESIDENT) {
            Allotment allotment = allotmentRepository
                    .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                    .orElseThrow(() -> new ResourceNotFoundException("No active allotment found"));

            flats = new PageImpl<>(List.of(allotment.getFlat()), pageable, 1);

        } else if (user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_SECURITY) {
            Long apartmentId = user.getManagedApartment() != null ? user.getManagedApartment().getId() : null;
            if (apartmentId == null) {
                flats = Page.empty(pageable);
            } else {
                if (search != null && !search.isBlank()) {
                    flats = flatRepository.findByBlock_Apartment_IdAndFlatNumberContainingIgnoreCase(apartmentId,
                            search, pageable);
                } else {
                    flats = flatRepository.findByBlock_Apartment_Id(apartmentId, pageable);
                }
            }
        } else {
            if (search != null && !search.isBlank()) {
                flats = flatRepository.findByFlatNumberContainingIgnoreCase(search, pageable);
            } else {
                flats = flatRepository.findAll(pageable);
            }
        }

        Page<FlatResponseDTO> dtoPage = flats.map(flatMapper::toDTO);

        PageResponse<FlatResponseDTO> pageResponse = new PageResponse<>(
                dtoPage.getContent(),
                dtoPage.getNumber(),
                dtoPage.getSize(),
                dtoPage.getTotalElements(),
                dtoPage.getTotalPages(),
                dtoPage.isLast());

        return ApiResponse.success("Flats fetched successfully", pageResponse);
    }

    @Override
    public FlatResponseDTO getFlatById(Long id) {

        Flat flat = flatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        User user = getLoggedInUser();

        if (user.getRole() == Role.ROLE_RESIDENT) {
            Allotment allotment = allotmentRepository
                    .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                    .orElseThrow(() -> new ResourceNotFoundException("No active allotment found"));

            if (!allotment.getFlat().getId().equals(id)) {
                throw new AccessDeniedException("You can only access your allotted flat");
            }
        }

        return flatMapper.toDTO(flat);
    }

    @Override
    public FlatResponseDTO updateFlat(Long id, FlatRequestDTO request) {

        Flat flat = flatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        Block block = blockRepository.findById(request.getBlockId())
                .orElseThrow(() -> new ResourceNotFoundException("Block not found"));

        flat.setFlatNumber(request.getFlatNumber());
        flat.setFloorNumber(request.getFloorNumber());
        flat.setType(request.getType());
        flat.setUnitSize(request.getUnitSize());
        flat.setStatus(request.getStatus());
        flat.setBlock(block);

        return flatMapper.toDTO(flatRepository.save(flat));
    }

    @Override
    public void deleteFlat(Long id) {

        Flat flat = flatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        flatRepository.delete(flat);
    }

    @Override
    public FlatResponseDTO getMyFlat() {

        User loggedInUser = userService.getLoggedInUser();

        Allotment allotment = allotmentRepository
                .findByUserAndStatus(loggedInUser, AllotmentStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active flat assigned"));

        Flat flat = allotment.getFlat();

        FlatResponseDTO dto = flatMapper.toDTO(flat);
        dto.setOwnershipStatus(allotment.getOwnershipStatus());
        dto.setMoveInDate(allotment.getStartDate());
        dto.setMoveOutDate(allotment.getEndDate());

        return dto;
    }

    private User getLoggedInUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.getUser();
        }

        throw new RuntimeException("Invalid authentication principal");
    }

}