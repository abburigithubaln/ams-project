package com.arah.apartment_management_system.service.impl;

import com.arah.apartment_management_system.dto.parking.AllocateParkingSlotRequest;
import com.arah.apartment_management_system.dto.parking.CreateParkingSlotRequest;
import com.arah.apartment_management_system.dto.parking.ParkingSlotResponseDTO;
import com.arah.apartment_management_system.entity.ParkingSlot;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.ParkingStatus;
import com.arah.apartment_management_system.mapper.ParkingMapper;
import com.arah.apartment_management_system.repository.ParkingSlotRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.service.ParkingService;
import com.arah.apartment_management_system.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ParkingServiceImpl implements ParkingService {

    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ParkingMapper parkingMapper;

    @Override
    public List<ParkingSlotResponseDTO> getAllSlots() {
        User loggedInUser = userService.getLoggedInUser();
        List<ParkingSlot> slots;

        if (loggedInUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            slots = parkingSlotRepository.findAll();
        } else if (loggedInUser.getManagedApartment() != null) {
            slots = parkingSlotRepository.findByApartmentId(loggedInUser.getManagedApartment().getId());
        } else {
            slots = List.of();
        }

        return slots.stream()
                .map(parkingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ParkingSlotResponseDTO> getMySlots() {
        User user = userService.getLoggedInUser();
        return parkingSlotRepository.findByResidentId(user.getId()).stream()
                .map(parkingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ParkingSlotResponseDTO createSlot(CreateParkingSlotRequest request) {
        User loggedInUser = userService.getLoggedInUser();
        ParkingSlot slot = ParkingSlot.builder()
                .slotNumber(request.getSlotNumber())
                .type(request.getType())
                .status(ParkingStatus.AVAILABLE)
                .apartment(loggedInUser.getManagedApartment())
                .build();
        return parkingMapper.toDTO(parkingSlotRepository.save(slot));
    }

    @Override
    public void deleteSlot(Long id) {
        User loggedInUser = userService.getLoggedInUser();
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (loggedInUser.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                slot.getApartment() != null &&
                (loggedInUser.getManagedApartment() == null
                        || !loggedInUser.getManagedApartment().getId().equals(slot.getApartment().getId()))) {
            throw new RuntimeException("Unauthorized: This slot does not belong to your apartment.");
        }

        parkingSlotRepository.delete(slot);
    }

    @Override
    public ParkingSlotResponseDTO allocateSlot(Long id, AllocateParkingSlotRequest request) {
        User loggedInUser = userService.getLoggedInUser();
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        User resident = userRepository.findById(request.getResidentId())
                .orElseThrow(() -> new RuntimeException("Resident not found"));

        if (loggedInUser.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            Long aptId = loggedInUser.getManagedApartment() != null ? loggedInUser.getManagedApartment().getId() : null;
            if (slot.getApartment() != null && (aptId == null || !aptId.equals(slot.getApartment().getId()))) {
                throw new RuntimeException("Unauthorized: This slot does not belong to your apartment.");
            }

            boolean residentInApt = userRepository.findAllByApartmentId(aptId).stream()
                    .anyMatch(u -> u.getId().equals(resident.getId()));
            if (!residentInApt) {
                throw new RuntimeException("Unauthorized: This resident does not belong to your apartment.");
            }
        }

        slot.setStatus(ParkingStatus.ALLOCATED);
        slot.setResident(resident);
        slot.setVehicleNumber(request.getVehicleNumber());
        slot.setExtra(request.isExtra());
        slot.setTemporary(request.isTemporary());
        slot.setAllocatedAt(LocalDateTime.now());

        return parkingMapper.toDTO(parkingSlotRepository.save(slot));
    }

    @Override
    public void deallocateSlot(Long id) {
        User loggedInUser = userService.getLoggedInUser();
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (loggedInUser.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                slot.getApartment() != null &&
                (loggedInUser.getManagedApartment() == null
                        || !loggedInUser.getManagedApartment().getId().equals(slot.getApartment().getId()))) {
            throw new RuntimeException("Unauthorized: This slot does not belong to your apartment.");
        }

        slot.setStatus(ParkingStatus.AVAILABLE);
        slot.setResident(null);
        slot.setVehicleNumber(null);
        slot.setExtra(false);
        slot.setTemporary(false);
        slot.setAllocatedAt(null);

        parkingSlotRepository.save(slot);
    }
}
