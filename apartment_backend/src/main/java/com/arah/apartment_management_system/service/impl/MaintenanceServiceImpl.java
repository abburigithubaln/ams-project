package com.arah.apartment_management_system.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.Maintenance;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.PaymentMethod;
import com.arah.apartment_management_system.enums.PaymentStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.repository.MaintenanceRepository;
import com.arah.apartment_management_system.service.MaintenanceService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;
import com.arah.apartment_management_system.mapper.MaintenanceMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

        private final MaintenanceRepository maintenanceRepository;
        private final AllotmentRepository allotmentRepository;
        private final FlatRepository flatRepository;
        private final UserService userService;
        private final MaintenanceMapper maintenanceMapper;

        @Override
        public ApiResponse<PageResponse<MaintenanceResponseDTO>> getAllMaintenance(
                        String status, Integer month, Integer year, Pageable pageable) {

                User user = userService.getLoggedInUser();
                Page<Maintenance> maintenancePage;

                Specification<Maintenance> spec = Specification.where(MaintenanceSpecification.hasStatus(status))
                                .and(MaintenanceSpecification.hasMonth(month))
                                .and(MaintenanceSpecification.hasYear(year));

                if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_RESIDENT) {

                        Allotment allotment = allotmentRepository
                                        .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                                        .orElseThrow(() -> new ResourceNotFoundException("No active allotment found"));

                        spec = spec.and((root, query, cb) -> cb.equal(root.get("flat").get("id"),
                                        allotment.getFlat().getId()));
                        maintenancePage = maintenanceRepository.findAll(spec, pageable);

                } else if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_ADMIN
                                || user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SECURITY) {
                        Long apartmentId = user.getManagedApartment() != null ? user.getManagedApartment().getId()
                                        : null;
                        spec = spec.and(MaintenanceSpecification.hasApartmentId(apartmentId));
                        maintenancePage = maintenanceRepository.findAll(spec, pageable);
                } else {
                        maintenancePage = maintenanceRepository.findAll(spec, pageable);
                }

                Page<MaintenanceResponseDTO> dtoPage = maintenancePage.map(maintenanceMapper::toDTO);

                PageResponse<MaintenanceResponseDTO> response = new PageResponse<>(
                                dtoPage.getContent(),
                                dtoPage.getNumber(),
                                dtoPage.getSize(),
                                dtoPage.getTotalElements(),
                                dtoPage.getTotalPages(),
                                dtoPage.isLast());

                return ApiResponse.success("Maintenance fetched successfully", response);
        }

        @Override
        public MaintenanceResponseDTO getCurrentMaintenance(Long flatId) {
                User user = userService.getLoggedInUser();
                int currentMonth = java.time.LocalDate.now().getMonthValue();
                int currentYear = java.time.LocalDate.now().getYear();

                Flat flat = flatRepository.findById(flatId)
                                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

                if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_RESIDENT) {
                        Allotment allotment = allotmentRepository.findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                                        .orElseThrow(() -> new ResourceNotFoundException("No active flat found"));
                        if (!flat.getId().equals(allotment.getFlat().getId())) {
                                throw new RuntimeException(
                                                "Unauthorized: You can only access your own flat maintenance");
                        }
                } else if (user.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
                        Long aptId = user.getManagedApartment() != null ? user.getManagedApartment().getId() : null;
                        if (aptId == null || !aptId.equals(flat.getBlock().getApartment().getId())) {
                                throw new RuntimeException("Unauthorized: This flat does not belong to your apartment");
                        }
                }

                Maintenance maintenance = maintenanceRepository
                                .findByFlatAndMonthAndYear(flat, currentMonth, currentYear)
                                .orElseThrow(() -> new ResourceNotFoundException("No maintenance for current month"));

                return maintenanceMapper.toDTO(maintenance);
        }

        @Override
        public void updateMaintenance(Long maintenanceId, Double amount, Integer month, Integer year) {
                User user = userService.getLoggedInUser();
                Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found"));

                if (user.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
                        Long aptId = user.getManagedApartment() != null ? user.getManagedApartment().getId() : null;
                        if (aptId == null || !aptId.equals(maintenance.getFlat().getBlock().getApartment().getId())) {
                                throw new RuntimeException(
                                                "Unauthorized: This maintenance record does not belong to your apartment.");
                        }
                }

                if (amount != null) {
                        maintenance.setAmount(amount);
                }
                if (month != null) {
                        maintenance.setMonth(month);
                }
                if (year != null) {
                        maintenance.setYear(year);
                }
                int updatedMonth = month != null ? month : maintenance.getMonth();
                int updatedYear = year != null ? year : maintenance.getYear();
                maintenance.setDueDate(LocalDate.of(updatedYear, updatedMonth, 1).plusDays(10));

                maintenanceRepository.save(maintenance);
        }

        @Override
        public void deleteMaintenance(Long maintenanceId) {
                User user = userService.getLoggedInUser();
                Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found"));

                if (user.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
                        Long aptId = user.getManagedApartment() != null ? user.getManagedApartment().getId() : null;
                        if (aptId == null || !aptId.equals(maintenance.getFlat().getBlock().getApartment().getId())) {
                                throw new RuntimeException(
                                                "Unauthorized: This maintenance record does not belong to your apartment.");
                        }
                }

                maintenanceRepository.delete(maintenance);
        }

        @Override
        public List<MaintenanceResponseDTO> getMyMaintenance() {

                User user = userService.getLoggedInUser();

                Allotment allotment = allotmentRepository
                                .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                                .orElseThrow(() -> new ResourceNotFoundException("No active allotment found"));

                return maintenanceRepository
                                .findByFlatId(allotment.getFlat().getId(), Pageable.unpaged())
                                .stream()
                                .map(maintenanceMapper::toDTO)
                                .toList();
        }

        @Override
        public MaintenanceResponseDTO getMaintenanceById(Long id) {

                Maintenance maintenance = maintenanceRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found"));

                User user = userService.getLoggedInUser();

                if (user.getRole().name().equals("ROLE_RESIDENT")) {

                        Allotment allotment = allotmentRepository
                                        .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                                        .orElseThrow(() -> new ResourceNotFoundException("No active allotment found"));

                        if (!maintenance.getFlat().getId()
                                        .equals(allotment.getFlat().getId())) {

                                throw new RuntimeException(
                                                "You can only access your flat maintenance");
                        }
                }

                return maintenanceMapper.toDTO(maintenance);
        }

        @Override
        public MaintenanceResponseDTO getAdminMaintenanceById(Long id) {
                User user = userService.getLoggedInUser();
                Maintenance maintenance = maintenanceRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found"));

                if (user.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
                        Long aptId = user.getManagedApartment() != null ? user.getManagedApartment().getId() : null;
                        if (aptId == null || !aptId.equals(maintenance.getFlat().getBlock().getApartment().getId())) {
                                throw new RuntimeException(
                                                "Unauthorized: This maintenance record does not belong to your apartment.");
                        }
                }

                return maintenanceMapper.toDTO(maintenance);
        }

        @Override
        public MaintenanceResponseDTO markAsPaid(Long id, PaymentMethod paymentMethod, String receiptUrl) {
                User user = userService.getLoggedInUser();
                Maintenance maintenance = maintenanceRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Maintenance not found"));

                if (user.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
                        Long aptId = user.getManagedApartment() != null ? user.getManagedApartment().getId() : null;
                        if (aptId == null || !aptId.equals(maintenance.getFlat().getBlock().getApartment().getId())) {
                                throw new RuntimeException(
                                                "Unauthorized: This maintenance record does not belong to your apartment.");
                        }
                }

                if (maintenance.getPaymentStatus() != PaymentStatus.PAID &&
                                LocalDate.now().isAfter(maintenance.getDueDate())) {
                        double interest = maintenance.getAmount() * 0.05; // 5% basic interest
                        maintenance.setAmount(maintenance.getAmount() + interest);
                }

                maintenance.setPaymentStatus(PaymentStatus.PAID);
                maintenance.setPaidDate(LocalDate.now());
                maintenance.setPaymentMethod(paymentMethod);
                maintenance.setReceiptUrl(receiptUrl);

                maintenanceRepository.save(maintenance);

                return maintenanceMapper.toDTO(maintenance);
        }

        @Override
        public void createBill(Long flatId, Double amount, int month, int year) {
                User user = userService.getLoggedInUser();
                Flat flat = flatRepository.findById(flatId)
                                .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));

                if (user.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
                        Long aptId = user.getManagedApartment() != null ? user.getManagedApartment().getId() : null;
                        if (aptId == null || !aptId.equals(flat.getBlock().getApartment().getId())) {
                                throw new RuntimeException(
                                                "Unauthorized: This flat does not belong to your apartment.");
                        }
                }

                LocalDate today = LocalDate.now();

                LocalDate previousMonth = today.minusMonths(1);

                int allowedMonth = previousMonth.getMonthValue();
                int allowedYear = previousMonth.getYear();

                if (month != allowedMonth || year != allowedYear) {
                        throw new RuntimeException(
                                        "Maintenance can only be created for previous month: "
                                                        + allowedMonth + "/" + allowedYear);
                }

                if (!allotmentRepository.findByFlatIdAndStatus(flatId, AllotmentStatus.ACTIVE).isPresent()) {
                        throw new RuntimeException("Cannot generate bill: Flat " + flat.getFlatNumber()
                                        + " has no active resident assigned.");
                }

                maintenanceRepository
                                .findByFlatAndMonthAndYear(flat, month, year)
                                .ifPresent(m -> {
                                        throw new RuntimeException(
                                                        "Maintenance already generated for this flat for this month & year");
                                });

                Maintenance maintenance = new Maintenance();

                maintenance.setFlat(flat);
                maintenance.setMonth(month);
                maintenance.setYear(year);
                maintenance.setAmount(amount);

                maintenance.setDueDate(
                                LocalDate.of(year, month, 1).plusMonths(1).plusDays(15));

                maintenance.setPaymentStatus(PaymentStatus.PENDING);

                maintenanceRepository.save(maintenance);
        }
}
