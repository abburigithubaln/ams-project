package com.arah.apartment_management_system.entity;

import com.arah.apartment_management_system.enums.MaintenanceRequestStatus;
import com.arah.apartment_management_system.enums.MaintenanceServiceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceServiceType serviceType;

    @Column(length = 2000)
    private String description;

    private Double basicCharges;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceRequestStatus status;

    private String preferredSlot; // Timing requested by resident

    private String allocatedSlot; // Timing set by admin
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff; // Staff allocated by admin

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flat_id")
    private Flat flat;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = MaintenanceRequestStatus.PENDING;
        }
        if (this.apartment == null && this.flat != null && this.flat.getBlock() != null) {
            this.apartment = this.flat.getBlock().getApartment();
        } else if (this.apartment == null && this.user != null) {
            if (this.user.getAllotments() != null && !this.user.getAllotments().isEmpty()) {
                 this.apartment = this.user.getAllotments().get(0).getFlat().getBlock().getApartment();
            }
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
