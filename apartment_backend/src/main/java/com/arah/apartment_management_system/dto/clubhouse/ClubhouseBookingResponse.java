package com.arah.apartment_management_system.dto.clubhouse;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.BookingStatus;
import com.arah.apartment_management_system.enums.ClubhouseSlot;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClubhouseBookingResponse {
    private Long id;
    private String name;
    private Long userId;
    private String username;
    private Long flatId;
    private String flatNumber;
    private String blockName;
    private String apartmentName;
    private String occasionType;
    private LocalDate occasionDate;
    private ClubhouseSlot slot;
    private Integer capacity;
    private Integer roomsForGuests;
    private String specialRequests;
    private String userRole;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
