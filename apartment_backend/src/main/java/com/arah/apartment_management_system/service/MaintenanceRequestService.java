package com.arah.apartment_management_system.service;

import com.arah.apartment_management_system.dto.maintenance.AdminUpdateServiceRequestDTO;
import com.arah.apartment_management_system.dto.maintenance.CreateServiceRequestDTO;
import com.arah.apartment_management_system.dto.maintenance.MaintenanceServiceResponseDTO;

import java.util.List;
import java.util.Map;

public interface MaintenanceRequestService {

    MaintenanceServiceResponseDTO raiseRequest(CreateServiceRequestDTO requestDTO, Long userId);

    List<MaintenanceServiceResponseDTO> getResidentRequests(Long userId);

    void cancelRequest(Long requestId, Long userId);

    List<MaintenanceServiceResponseDTO> getAllRequests();

    MaintenanceServiceResponseDTO updateByAdmin(Long requestId, AdminUpdateServiceRequestDTO updateDTO);

    void deleteRequest(Long requestId);

    Map<String, Double> getBasicCharges();
}
