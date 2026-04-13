package com.arah.apartment_management_system.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.facility.FacilityRequestDTO;
import com.arah.apartment_management_system.dto.facility.FacilityResponseDTO;
import com.arah.apartment_management_system.entity.Facility;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.FacilityStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.FacilityRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.service.FacilityService;
import com.arah.apartment_management_system.mapper.FacilityMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final FacilityMapper facilityMapper;
    private final com.arah.apartment_management_system.service.UserService userService;

    @Override
    public FacilityResponseDTO createFacility(FacilityRequestDTO request) {
        User admin = userService.getLoggedInUser();
        Facility facility = Facility.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : FacilityStatus.AVAILABLE)
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .charges(request.getCharges())
                .capacity(request.getCapacity())
                .apartment(admin.getManagedApartment())
                .build();

        Facility saved = facilityRepository.save(facility);
        return facilityMapper.toDTO(saved);
    }

    @Override
    public FacilityResponseDTO updateFacility(Long id, FacilityRequestDTO request) {
        User admin = userService.getLoggedInUser();
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));

        if (admin.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                (facility.getApartment() == null
                        || !facility.getApartment().getId().equals(admin.getManagedApartment().getId()))) {
            throw new RuntimeException("Unauthorized to update this facility");
        }

        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            facility.setStatus(request.getStatus());
        }
        facility.setOpeningTime(request.getOpeningTime());
        facility.setClosingTime(request.getClosingTime());
        facility.setCharges(request.getCharges());
        facility.setCapacity(request.getCapacity());

        Facility updated = facilityRepository.save(facility);
        return facilityMapper.toDTO(updated);
    }

    @Override
    public void deleteFacility(Long id) {
        User admin = userService.getLoggedInUser();
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));

        if (admin.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                (facility.getApartment() == null
                        || !facility.getApartment().getId().equals(admin.getManagedApartment().getId()))) {
            throw new RuntimeException("Unauthorized to delete this facility");
        }

        facilityRepository.delete(facility);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacilityResponseDTO> getAllFacilities() {
        User loggedInUser = userService.getLoggedInUser();
        // Re-fetch to ensure relationship proxy is initialized in this session
        User contextUser = userRepository.findById(loggedInUser.getId()).orElse(loggedInUser);

        List<Facility> facilities;

        if (contextUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            facilities = facilityRepository.findAllByOrderByCreatedAtDesc();
        } else {
            Long apartmentId = contextUser.getManagedApartment() != null
                    ? contextUser.getManagedApartment().getId()
                    : contextUser.getAllotments() != null ? contextUser.getAllotments().stream()
                            .filter(a -> a
                                    .getStatus() == com.arah.apartment_management_system.enums.AllotmentStatus.ACTIVE)
                            .findFirst()
                            .map(a -> a.getFlat().getBlock().getApartment().getId())
                            .orElse(null) : null;

            if (apartmentId != null) {
                facilities = facilityRepository.findByApartmentIdOrderByCreatedAtDesc(apartmentId);
            } else {
                facilities = List.of();
            }
        }

        return facilities.stream()
                .map(facilityMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FacilityResponseDTO getFacilityById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));
        return facilityMapper.toDTO(facility);
    }
}
