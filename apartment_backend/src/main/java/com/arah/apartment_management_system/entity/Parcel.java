package com.arah.apartment_management_system.entity;

import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.ParcelStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Parcel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientName;

    private String flatNumber;

    private String courier;

    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParcelStatus status;

    private LocalDateTime receivedTime;

    private LocalDateTime collectedTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @PrePersist
    public void prePersist() {
        if (this.status == null)
            this.status = ParcelStatus.PENDING;
        if (this.receivedTime == null)
            this.receivedTime = LocalDateTime.now();
    }
}
