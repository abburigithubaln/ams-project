package com.arah.apartment_management_system.service;

import java.time.LocalDate;
import java.util.List;

import com.arah.apartment_management_system.dto.clubhouse.ClubhouseBookingRequest;
import com.arah.apartment_management_system.dto.clubhouse.ClubhouseBookingResponse;
import com.arah.apartment_management_system.enums.BookingStatus;

public interface ClubhouseBookingService {

    ClubhouseBookingResponse createBooking(ClubhouseBookingRequest request);

    List<ClubhouseBookingResponse> getMyBookings();

    List<ClubhouseBookingResponse> getAllBookings(LocalDate startDate, LocalDate endDate);

    ClubhouseBookingResponse updateStatus(Long bookingId, BookingStatus status);

    ClubhouseBookingResponse updateBooking(Long id, ClubhouseBookingRequest request);

    void deleteBooking(Long id);

    Integer getMaxCapacity();

    Integer setMaxCapacity(Integer capacity);
}

