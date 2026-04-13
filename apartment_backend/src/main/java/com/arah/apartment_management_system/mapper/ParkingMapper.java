package com.arah.apartment_management_system.mapper;

import com.arah.apartment_management_system.dto.parking.ParkingSlotResponseDTO;
import com.arah.apartment_management_system.entity.ParkingSlot;
import org.springframework.stereotype.Component;

@Component
public class ParkingMapper {

    public ParkingSlotResponseDTO toDTO(ParkingSlot slot) {
        if (slot == null) return null;

        ParkingSlotResponseDTO dto = new ParkingSlotResponseDTO();
        dto.setId(slot.getId());
        dto.setSlotNumber(slot.getSlotNumber());
        dto.setType(slot.getType());
        dto.setStatus(slot.getStatus().name());
        dto.setVehicleNumber(slot.getVehicleNumber());
        dto.setExtra(slot.isExtra());
        dto.setTemporary(slot.isTemporary());
        dto.setAllocatedAt(slot.getAllocatedAt());

        if (slot.getResident() != null) {
            dto.setResidentId(slot.getResident().getId());
            dto.setResidentName(slot.getResident().getUsername());

            if (slot.getResident().getAllotments() != null && !slot.getResident().getAllotments().isEmpty()) {
                slot.getResident().getAllotments().stream()
                    .filter(a -> a.getFlat() != null)
                    .findFirst()
                    .ifPresent(a -> dto.setFlatNumber(a.getFlat().getFlatNumber()));
            }
        }

        return dto;
    }
}
