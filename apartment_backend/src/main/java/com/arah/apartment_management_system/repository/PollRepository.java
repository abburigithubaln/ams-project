package com.arah.apartment_management_system.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.arah.apartment_management_system.entity.Poll;
import com.arah.apartment_management_system.enums.PollStatus;

public interface PollRepository extends JpaRepository<Poll, Long>{
    List<Poll> findByStatus(PollStatus status);
    
    @Query("SELECT p FROM Poll p WHERE p.status = 'ACTIVE' AND p.endDate >= :today AND p.apartment.id = :aptId")
    List<Poll> findActivePolls(@Param("today") LocalDate today, @Param("aptId") Long aptId);

    @Query("SELECT p FROM Poll p WHERE (p.status = 'CLOSED' OR (p.status = 'ACTIVE' AND p.endDate < :today)) AND p.apartment.id = :aptId")
    List<Poll> findClosedPolls(@Param("today") LocalDate today, @Param("aptId") Long aptId);

    List<Poll> findByApartmentId(Long apartmentId);

    @Modifying
    @Query("UPDATE Poll p SET p.status = 'CLOSED' WHERE p.endDate < :today AND p.status = 'ACTIVE'")
    int closeExpiredPolls(@Param("today") LocalDate today);
}
