package com.arah.apartment_management_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;

public interface AllotmentRepository extends JpaRepository<Allotment, Long> {

    List<Allotment> findByStatus(AllotmentStatus status);

    Optional<Allotment> findByUserAndStatus(User user, AllotmentStatus status);

    Optional<Allotment> findByUser(User user);

    Optional<Allotment> findByFlatAndStatus(Flat flat, AllotmentStatus status);

    Optional<Allotment> findByFlatIdAndStatus(Long flatId, AllotmentStatus status);

    Optional<Allotment> findByUserIdAndStatus(Long userId, AllotmentStatus status);
}