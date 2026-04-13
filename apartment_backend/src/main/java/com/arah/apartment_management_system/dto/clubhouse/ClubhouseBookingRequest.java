package com.arah.apartment_management_system.dto.clubhouse;

import java.time.LocalDate;

import com.arah.apartment_management_system.enums.ClubhouseSlot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClubhouseBookingRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private Long flatId;

    @NotBlank(message = "Occasion type is required")
    private String occasionType;

    @NotNull(message = "Occasion date is required")
    private LocalDate occasionDate;

    @NotNull(message = "Slot (DAY or NIGHT) is required")
    private ClubhouseSlot slot;

    private Integer capacity;

    private Integer roomsForGuests;

    private String specialRequests;
}
