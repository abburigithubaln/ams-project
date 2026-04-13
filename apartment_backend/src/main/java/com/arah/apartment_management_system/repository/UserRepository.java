package com.arah.apartment_management_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByResetToken(String token);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<User> findByStatus(UserStatus status);

    List<User> findByRole(Role role);

    List<User> findByRoleIn(List<Role> roles);

    List<User> findByRoleAndStatus(Role role, UserStatus status);

    List<User> findByStatusAndRoleIn(UserStatus status, List<Role> roles);

    List<User> findByManagedApartmentId(Long apartmentId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u FROM User u LEFT JOIN u.allotments a LEFT JOIN a.flat f LEFT JOIN f.block b WHERE b.apartment.id = :apartmentId OR u.managedApartment.id = :apartmentId")
    List<User> findAllByApartmentId(@org.springframework.data.repository.query.Param("apartmentId") Long apartmentId);
}