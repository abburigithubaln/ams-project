package com.arah.apartment_management_system.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.BookingStatus;
import com.arah.apartment_management_system.enums.ClubhouseSlot;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubhouseBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flat_id")
    private Flat flat;

    @Column(nullable = false)
    private String occasionType;

    @Column(nullable = false)
    private LocalDate occasionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClubhouseSlot slot;

    private Integer capacity;

    private Integer roomsForGuests;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(length = 2000)
    private String specialRequests;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null)
            this.status = BookingStatus.PENDING;
        if (this.slot == null)
            this.slot = ClubhouseSlot.DAY;

        if (this.apartment == null && this.flat != null && this.flat.getBlock() != null) {
            this.apartment = this.flat.getBlock().getApartment();
        } else if (this.apartment == null && this.user != null && this.user.getManagedApartment() != null) {
            this.apartment = this.user.getManagedApartment();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}