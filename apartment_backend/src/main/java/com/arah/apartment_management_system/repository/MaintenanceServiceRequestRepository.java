package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.MaintenanceServiceRequest;
import com.arah.apartment_management_system.enums.MaintenanceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceServiceRequestRepository extends JpaRepository<MaintenanceServiceRequest, Long> {
    
    List<MaintenanceServiceRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<MaintenanceServiceRequest> findAllByOrderByCreatedAtDesc();
    
    List<MaintenanceServiceRequest> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);

    List<MaintenanceServiceRequest> findByStatusOrderByCreatedAtDesc(MaintenanceRequestStatus status);

    @Query("SELECT m FROM MaintenanceServiceRequest m WHERE m.flat.id = :flatId ORDER BY m.createdAt DESC")
    List<MaintenanceServiceRequest> findByFlatId(Long flatId);
}
