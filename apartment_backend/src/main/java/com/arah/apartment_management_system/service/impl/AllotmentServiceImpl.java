package com.arah.apartment_management_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.allotment.*;
import com.arah.apartment_management_system.entity.*;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.*;
import com.arah.apartment_management_system.service.AllotmentService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.mapper.AllotmentMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllotmentServiceImpl implements AllotmentService {

    private final AllotmentRepository allotmentRepository;
    private final UserRepository userRepository;
    private final FlatRepository flatRepository;
    private final UserService userService;
    private final AllotmentMapper allotmentMapper;

    @Override
    public AllotmentResponseDTO createAllotment(AllotmentRequestDTO request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Flat flat = flatRepository.findById(request.getFlatId())
                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

        Allotment allotment = Allotment.builder()
                .user(user)
                .flat(flat)
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .status(AllotmentStatus.ACTIVE)
                .ownershipStatus(request.getOwnershipStatus())
                .build();

        flat.setStatus(com.arah.apartment_management_system.enums.FlatStatus.ALLOCATED);
        flatRepository.save(flat);

        return allotmentMapper.toDTO(allotmentRepository.save(allotment));
    }

    @Override
    public AllotmentResponseDTO getMyAllotment() {

        User user = userService.getLoggedInUser();

        Allotment allotment = allotmentRepository.findByUserAndStatus(
                user,
                AllotmentStatus.ACTIVE).orElseThrow(() -> new RuntimeException("No active allotment"));

        return allotmentMapper.toDTO(allotment);
    }

    @Override
    public void vacateFlat(Long allotmentId) {

        Allotment allotment = allotmentRepository.findById(allotmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Allotment not found"));

        allotment.setStatus(AllotmentStatus.VACATED);
        allotment.setEndDate(LocalDate.now());

        Flat flat = allotment.getFlat();
        if (flat != null) {
            flat.setStatus(com.arah.apartment_management_system.enums.FlatStatus.AVAILABLE);
            flatRepository.save(flat);
        }

        allotmentRepository.save(allotment);
    }

    @Override
    public List<AllotmentResponseDTO> getAllotmentHistory() {
        User admin = userService.getLoggedInUser();
        List<Allotment> allotments;

        if (admin.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            allotments = allotmentRepository.findAll();
        } else if (admin.getManagedApartment() != null) {
            Long apiAptId = admin.getManagedApartment().getId();
            allotments = allotmentRepository.findAll().stream()
                    .filter(a -> a.getFlat() != null && 
                                a.getFlat().getBlock() != null && 
                                a.getFlat().getBlock().getApartment().getId().equals(apiAptId))
                    .toList();
        } else {
            allotments = List.of();
        }

        return allotments.stream()
                .map(allotmentMapper::toDTO)
                .collect(Collectors.toList());
    }

}
