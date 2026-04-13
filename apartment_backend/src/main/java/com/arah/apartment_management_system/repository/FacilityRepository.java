package com.arah.apartment_management_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.Facility;
import com.arah.apartment_management_system.enums.FacilityStatus;

public interface FacilityRepository extends JpaRepository<Facility, Long> {

    List<Facility> findAllByOrderByCreatedAtDesc();

    List<Facility> findByStatusOrderByCreatedAtDesc(FacilityStatus status);

    List<Facility> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);
}
