package com.arah.apartment_management_system.service;

import com.arah.apartment_management_system.dto.parking.AllocateParkingSlotRequest;
import com.arah.apartment_management_system.dto.parking.CreateParkingSlotRequest;
import com.arah.apartment_management_system.dto.parking.ParkingSlotResponseDTO;

import java.util.List;

public interface ParkingService {
    List<ParkingSlotResponseDTO> getAllSlots();
    List<ParkingSlotResponseDTO> getMySlots();
    ParkingSlotResponseDTO createSlot(CreateParkingSlotRequest request);
    void deleteSlot(Long id);
    ParkingSlotResponseDTO allocateSlot(Long id, AllocateParkingSlotRequest request);
    void deallocateSlot(Long id);
}
