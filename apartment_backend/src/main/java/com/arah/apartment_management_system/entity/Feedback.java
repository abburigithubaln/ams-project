package com.arah.apartment_management_system.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // FEEDBACK or SUPPORT

    @Column(nullable = false)
    private String title;

    @Column(length = 5000)
    private String description;

    @Column(nullable = false)
    private String status; // PENDING, ACKNOWLEDGED, RESOLVED, CLOSED

    @Column(length = 3000)
    private String adminResponse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flat_id")
    private Flat flat;

    private LocalDateTime createdAt;

    private LocalDateTime respondedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.apartment == null && this.flat != null && this.flat.getBlock() != null) {
            this.apartment = this.flat.getBlock().getApartment();
        } else if (this.apartment == null && this.user != null) {
            // Find apartment from user's allotments if flat is null
            if (this.user.getAllotments() != null && !this.user.getAllotments().isEmpty()) {
                 this.apartment = this.user.getAllotments().get(0).getFlat().getBlock().getApartment();
            }
        }
    }
}
