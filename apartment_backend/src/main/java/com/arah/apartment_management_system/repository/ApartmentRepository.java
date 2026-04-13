package com.arah.apartment_management_system.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.arah.apartment_management_system.entity.Apartment;

public interface ApartmentRepository extends JpaRepository<Apartment, Long>{
	
    @Query("SELECT a FROM Apartment a WHERE a.status = 'ENABLED' " +
           "AND NOT EXISTS (SELECT u FROM User u WHERE u.managedApartment = a " +
           "AND u.role = com.arah.apartment_management_system.enums.Role.ROLE_ADMIN)")
    List<Apartment> findAvailableApartments();

    List<Apartment> findByStatus(com.arah.apartment_management_system.enums.ApartmentStatus status);
}
