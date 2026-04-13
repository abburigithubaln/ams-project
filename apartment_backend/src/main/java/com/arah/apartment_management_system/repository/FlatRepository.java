package com.arah.apartment_management_system.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.Flat;

public interface FlatRepository extends JpaRepository<Flat, Long> {

    Page<Flat> findByFlatNumberContainingIgnoreCase(String flatNumber, Pageable pageable);

    Page<Flat> findByBlock_Apartment_Id(Long apartmentId, Pageable pageable);

    Page<Flat> findByBlock_Apartment_IdAndFlatNumberContainingIgnoreCase(Long apartmentId, String flatNumber, Pageable pageable);
}
