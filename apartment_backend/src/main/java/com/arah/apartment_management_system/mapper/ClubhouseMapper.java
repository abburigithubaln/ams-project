package com.arah.apartment_management_system.mapper;

import com.arah.apartment_management_system.dto.clubhouse.ClubhouseBookingResponse;
import com.arah.apartment_management_system.entity.ClubhouseBooking;
import org.springframework.stereotype.Component;

@Component
public class ClubhouseMapper {

    public ClubhouseBookingResponse toDTO(ClubhouseBooking booking) {
        String blockName = null;
        String apartmentName = null;
        if (booking.getFlat() != null && booking.getFlat().getBlock() != null) {
            blockName = booking.getFlat().getBlock().getBlockName();
            if (booking.getFlat().getBlock().getApartment() != null) {
                apartmentName = booking.getFlat().getBlock().getApartment().getName();
            }
        }

        return ClubhouseBookingResponse.builder()
                .id(booking.getId())
                .name(booking.getName())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .username(booking.getUser() != null ? booking.getUser().getUsername() : null)
                .flatId(booking.getFlat() != null ? booking.getFlat().getId() : null)
                .flatNumber(booking.getFlat() != null ? booking.getFlat().getFlatNumber() : null)
                .blockName(blockName)
                .apartmentName(apartmentName)
                .occasionType(booking.getOccasionType())
                .occasionDate(booking.getOccasionDate())
                .slot(booking.getSlot())
                .capacity(booking.getCapacity())
                .roomsForGuests(booking.getRoomsForGuests())
                .specialRequests(booking.getSpecialRequests())
                .userRole(booking.getUser() != null ? booking.getUser().getRole().name() : null)
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
