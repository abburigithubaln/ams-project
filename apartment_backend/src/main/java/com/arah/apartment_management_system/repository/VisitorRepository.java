package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.arah.apartment_management_system.entity.Visitor;
import com.arah.apartment_management_system.enums.VisitorStatus;

import java.util.List;
import java.util.Optional;

public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    List<Visitor> findByFlatNumber(String flatNumber);
    List<Visitor> findByFlatNumberAndApartmentId(String flatNumber, Long apartmentId);
    Optional<Visitor> findByOtp(String otp);
    List<Visitor> findByApartmentId(Long apartmentId);
    List<Visitor> findByFlatNumberAndStatus(String flatNumber, VisitorStatus status);
}
