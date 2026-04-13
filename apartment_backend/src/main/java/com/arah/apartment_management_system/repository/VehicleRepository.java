package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.arah.apartment_management_system.entity.Vehicle;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByFlatNumber(String flatNumber);
    
    List<Vehicle> findByApartmentId(Long apartmentId);
}
