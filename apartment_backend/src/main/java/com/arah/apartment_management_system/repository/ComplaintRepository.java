package com.arah.apartment_management_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.Complaint;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.ComplaintStatus;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUser(User user);

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    List<Complaint> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Complaint c WHERE c.status IN :statuses")
    long countByStatusIn(@org.springframework.data.repository.query.Param("statuses") List<ComplaintStatus> statuses);
}
