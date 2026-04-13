package com.arah.apartment_management_system.entity;

import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.VehicleStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String vehicleNumber;

    private String vehicleType;

    private String ownerName;

    private String flatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    private LocalDateTime entryTime;

    private LocalDateTime exitTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @PrePersist
    public void prePersist() {
        if (this.status == null)
            this.status = VehicleStatus.PARKED;
        if (this.entryTime == null)
            this.entryTime = LocalDateTime.now();
    }
}
