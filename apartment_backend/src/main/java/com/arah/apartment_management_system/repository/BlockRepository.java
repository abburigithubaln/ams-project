package com.arah.apartment_management_system.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.Block;

public interface BlockRepository extends JpaRepository<Block, Long> {

    Page<Block> findByBlockNameContainingIgnoreCase(String blockName, Pageable pageable);

    Page<Block> findByApartmentId(Long apartmentId, Pageable pageable);

    java.util.List<com.arah.apartment_management_system.entity.Block> findByApartmentId(Long apartmentId);
}
