package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.ClubhouseBooking;
import com.arah.apartment_management_system.enums.BookingStatus;
import com.arah.apartment_management_system.enums.ClubhouseSlot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.entity.Flat;

@Repository
public interface ClubhouseBookingRepository extends JpaRepository<ClubhouseBooking, Long> {
    List<ClubhouseBooking> findByUserOrderByCreatedAtDesc(User user);

    List<ClubhouseBooking> findByUserOrFlatOrderByCreatedAtDesc(User user, Flat flat);

    List<ClubhouseBooking> findAllByOrderByCreatedAtDesc();

    List<ClubhouseBooking> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);

    List<ClubhouseBooking> findByOccasionDateBetweenAndApartmentId(LocalDate start, LocalDate end, Long apartmentId);

    List<ClubhouseBooking> findByOccasionDateGreaterThanEqualAndApartmentId(LocalDate start, Long apartmentId);

    List<ClubhouseBooking> findByOccasionDateLessThanEqualAndApartmentId(LocalDate end, Long apartmentId);

    List<ClubhouseBooking> findByOccasionDateBetween(LocalDate startDate, LocalDate endDate);

    List<ClubhouseBooking> findByOccasionDateGreaterThanEqual(LocalDate startDate);

    List<ClubhouseBooking> findByOccasionDateLessThanEqual(LocalDate endDate);

    Optional<ClubhouseBooking> findByOccasionDateAndSlotAndStatusIn(
            LocalDate occasionDate,
            ClubhouseSlot slot,
            List<BookingStatus> statuses);
}
