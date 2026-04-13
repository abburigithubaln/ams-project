package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.ParkingSlot;
import com.arah.apartment_management_system.enums.ParkingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByResidentId(Long residentId);
    List<ParkingSlot> findByStatus(ParkingStatus status);
    List<ParkingSlot> findByIsTemporary(boolean isTemporary);
    List<ParkingSlot> findByApartmentId(Long apartmentId);
}
