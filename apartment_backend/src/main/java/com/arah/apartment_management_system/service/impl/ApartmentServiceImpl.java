package com.arah.apartment_management_system.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import jakarta.transaction.Transactional;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.dto.apartment.ApartmentResponseDTO;
import com.arah.apartment_management_system.dto.apartment.UpdateApartmentRequest;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.arah.apartment_management_system.dto.apartment.ApartmentRequestDTO;
import com.arah.apartment_management_system.entity.Apartment;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.ApartmentRepository;
import com.arah.apartment_management_system.service.ApartmentService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;
import com.arah.apartment_management_system.mapper.ApartmentMapper;

import lombok.RequiredArgsConstructor;

import com.arah.apartment_management_system.dto.DashboardStats;
import com.arah.apartment_management_system.enums.ApartmentStatus;
import com.arah.apartment_management_system.repository.*;
import com.arah.apartment_management_system.enums.ComplaintStatus;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;

@Service
@RequiredArgsConstructor
public class ApartmentServiceImpl implements ApartmentService {

        private final ApartmentRepository apartmentRepository;
        private final ApartmentMapper apartmentMapper;
        private final BlockRepository blockRepository;
        private final FlatRepository flatRepository;
        private final UserRepository userRepository;
        private final ComplaintRepository complaintRepository;

        @Override
        public ApartmentResponseDTO createApartment(ApartmentRequestDTO request) {

                Apartment apartment = apartmentMapper.toEntity(request);
                Apartment saved = apartmentRepository.save(apartment);

                return apartmentMapper.toDTO(saved);
        }

        @Override
        public ApiResponse<PageResponse<ApartmentResponseDTO>> getAllApartments(
                        int page,
                        int size,
                        String sortBy) {

                Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));

                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication();
                String username = auth != null ? auth.getName() : null;
                User user = username != null ? userRepository.findByUsername(username).orElse(null) : null;

                Page<Apartment> apartmentPage;
                if (user != null && user.getRole() != Role.ROLE_SUPER_ADMIN && user.getManagedApartment() != null) {
                        Apartment apt = user.getManagedApartment();
                        apartmentPage = new org.springframework.data.domain.PageImpl<>(
                                        List.of(apt), pageable, 1);
                } else {
                        apartmentPage = apartmentRepository.findAll(pageable);
                }

                List<ApartmentResponseDTO> content = apartmentPage.getContent()
                                .stream()
                                .map(apartmentMapper::toDTO)
                                .toList();

                PageResponse<ApartmentResponseDTO> pageResponse = new PageResponse<>(
                                content,
                                apartmentPage.getNumber(),
                                apartmentPage.getSize(),
                                apartmentPage.getTotalElements(),
                                apartmentPage.getTotalPages(),
                                apartmentPage.isLast());

                return ApiResponse.success("Apartments fetched successfully", pageResponse);

        }

        @Override
        public ApartmentResponseDTO getApartmentById(Long id) {

                Apartment apartment = apartmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));

                return apartmentMapper.toDTO(apartment);
        }

        @Override
        public void deleteApartment(Long id) {

                Apartment apartment = apartmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));

                apartmentRepository.delete(apartment);
        }

        @Override
        public void updateApartment(Long id, UpdateApartmentRequest request) {

                Apartment apartment = apartmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));

                apartment.setName(request.getName());
                apartment.setAddress(request.getAddress());

                apartmentRepository.save(apartment);
        }

        @Override
        @Transactional
        public void disableApartment(Long id) {
                Apartment apartment = apartmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));
                apartment.setStatus(ApartmentStatus.DISABLED);
                apartmentRepository.save(apartment);

                List<User> admins = userRepository.findByManagedApartmentId(id).stream()
                                .filter(u -> u.getRole() == Role.ROLE_ADMIN)
                                .toList();

                for (User admin : admins) {
                        admin.setStatus(UserStatus.DEACTIVATED);
                        userRepository.save(admin);
                }
        }

        @Override
        @Transactional
        public void enableApartment(Long id) {
                Apartment apartment = apartmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));
                apartment.setStatus(ApartmentStatus.ENABLED);
                apartmentRepository.save(apartment);

                List<User> admins = userRepository.findByManagedApartmentId(id).stream()
                                .filter(u -> u.getRole() == Role.ROLE_ADMIN)
                                .toList();

                for (User admin : admins) {
                        admin.setStatus(UserStatus.APPROVED);
                        userRepository.save(admin);
                }
        }

        @Override
        public DashboardStats getGlobalDashboardStats() {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication();
                String username = auth != null ? auth.getName() : null;
                User user = username != null ? userRepository.findByUsername(username).orElse(null) : null;

                if (user != null && user.getRole() != Role.ROLE_SUPER_ADMIN && user.getManagedApartment() != null) {
                        Long aptId = user.getManagedApartment().getId();
                        long flats = flatRepository
                                        .findByBlock_Apartment_Id(aptId,
                                                        org.springframework.data.domain.Pageable.unpaged())
                                        .getTotalElements();
                        long blocks = blockRepository
                                        .findByApartmentId(aptId, org.springframework.data.domain.Pageable.unpaged())
                                        .getTotalElements();
                        long residents = userRepository.findAllByApartmentId(aptId).stream().filter(
                                        u -> u.getRole() == Role.ROLE_RESIDENT && u.getStatus() == UserStatus.APPROVED)
                                        .count();
                        long staff = userRepository.findByManagedApartmentId(aptId).stream().filter(
                                        u -> (u.getRole() == Role.ROLE_SECURITY || u.getRole() == Role.ROLE_ADMIN)
                                                        && u.getStatus() == UserStatus.APPROVED)
                                        .count();
                        long complaints = complaintRepository.findByApartmentIdOrderByCreatedAtDesc(aptId).stream()
                                        .filter(c -> c.getStatus() == ComplaintStatus.PENDING
                                                        || c.getStatus() == ComplaintStatus.IN_PROGRESS)
                                        .count();

                        return DashboardStats.builder()
                                        .totalApartments(1L)
                                        .totalBlocks(blocks)
                                        .totalFlats(flats)
                                        .totalResidents(residents)
                                        .totalStaff(staff)
                                        .activeComplaints(complaints)
                                        .build();
                }

                return DashboardStats.builder()
                                .totalApartments(apartmentRepository.count())
                                .totalBlocks(blockRepository.count())
                                .totalFlats(flatRepository.count())
                                .totalResidents(userRepository
                                                .findByRoleAndStatus(Role.ROLE_RESIDENT, UserStatus.APPROVED).size())
                                .totalStaff(userRepository.findByRoleAndStatus(Role.ROLE_SECURITY, UserStatus.APPROVED)
                                                .size() +
                                                userRepository.findByRoleAndStatus(Role.ROLE_ADMIN, UserStatus.APPROVED)
                                                                .size())
                                .activeComplaints(complaintRepository.countByStatusIn(
                                                List.of(ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS)))
                                .build();
        }

        @Override
        public List<ApartmentResponseDTO> getAvailableApartments() {
                return apartmentRepository.findAvailableApartments().stream()
                                .map(apartmentMapper::toDTO)
                                .toList();
        }

        @Override
        public List<ApartmentResponseDTO> getEnabledApartments() {
                return apartmentRepository.findByStatus(ApartmentStatus.ENABLED).stream()
                                .map(apartmentMapper::toDTO)
                                .toList();
        }
}
