package com.arah.apartment_management_system.entity;

import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.VisitorStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;

    private String flatNumber;

    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private VisitorStatus status;

    private LocalDateTime entryTime;

    private LocalDateTime exitTime;
    private String otp;
    private boolean isPreApproved;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @PrePersist
    public void prePersist() {
        if (this.status == null)
            this.status = VisitorStatus.CHECKED_IN;
        
        // Only set entryTime if the visitor is checking in directly
        if (this.status == VisitorStatus.CHECKED_IN && this.entryTime == null)
            this.entryTime = LocalDateTime.now();
    }
}
