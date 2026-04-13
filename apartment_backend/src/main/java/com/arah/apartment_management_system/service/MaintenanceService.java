package com.arah.apartment_management_system.service;

import java.util.List;
import org.springframework.data.domain.Pageable;

import com.arah.apartment_management_system.enums.PaymentMethod;
import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;

public interface MaintenanceService {

    ApiResponse<PageResponse<MaintenanceResponseDTO>> getAllMaintenance(
            String status, Integer month, Integer year, Pageable pageable);

    MaintenanceResponseDTO getMaintenanceById(Long id);

    MaintenanceResponseDTO getAdminMaintenanceById(Long id);

    List<MaintenanceResponseDTO> getMyMaintenance();

    MaintenanceResponseDTO getCurrentMaintenance(Long flatId);

    public MaintenanceResponseDTO markAsPaid(Long id, PaymentMethod paymentMethod, String receiptUrl);

    void createBill(Long flatId, Double amount, int month, int year);

    void updateMaintenance(Long maintenanceId, Double amount, Integer month, Integer year);

    void deleteMaintenance(Long maintenanceId);
    
}