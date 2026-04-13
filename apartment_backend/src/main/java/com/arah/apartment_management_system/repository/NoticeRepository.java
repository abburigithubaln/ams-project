package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.arah.apartment_management_system.entity.Notice;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByApartmentIdOrderByIdDesc(Long apartmentId);
}
