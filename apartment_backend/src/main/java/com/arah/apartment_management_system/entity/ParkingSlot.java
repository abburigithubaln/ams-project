package com.arah.apartment_management_system.entity;

import com.arah.apartment_management_system.enums.ParkingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "parking_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slotNumber;

    @Column(nullable = false)
    private String type; // TWO_WHEELER, FOUR_WHEELER, etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParkingStatus status = ParkingStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id")
    private User resident;

    private String vehicleNumber;

    @Builder.Default
    private boolean isExtra = false;

    @Builder.Default
    private boolean isTemporary = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    private LocalDateTime allocatedAt;
}
