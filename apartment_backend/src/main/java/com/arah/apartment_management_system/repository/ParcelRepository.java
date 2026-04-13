package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.arah.apartment_management_system.entity.Parcel;
import com.arah.apartment_management_system.enums.ParcelStatus;

import java.util.List;

public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    List<Parcel> findByFlatNumber(String flatNumber);
    List<Parcel> findByFlatNumberAndApartmentId(String flatNumber, Long apartmentId);
    
    List<Parcel> findByStatus(ParcelStatus status);
    
    List<Parcel> findByApartmentId(Long apartmentId);
}
