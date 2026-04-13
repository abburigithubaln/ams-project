package com.arah.apartment_management_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.Feedback;
import com.arah.apartment_management_system.entity.User;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByUser(User user);

    List<Feedback> findAllByOrderByCreatedAtDesc();

    List<Feedback> findByTypeOrderByCreatedAtDesc(String type);

    List<Feedback> findByUserOrderByCreatedAtDesc(User user);

    List<Feedback> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);

    List<Feedback> findByApartmentIdAndTypeOrderByCreatedAtDesc(Long apartmentId, String type);
}
