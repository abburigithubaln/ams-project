package com.arah.apartment_management_system.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.arah.apartment_management_system.entity.Maintenance;
import com.arah.apartment_management_system.entity.Flat;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long>, JpaSpecificationExecutor<Maintenance> {

    Optional<Maintenance> findByFlatAndMonthAndYear(Flat flat, int month, int year);
    
    Page<Maintenance> findByFlatId(Long flatId, Pageable pageable);

    List<Maintenance> findByFlat(Flat flat);
}
