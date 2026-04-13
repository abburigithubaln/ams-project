package com.arah.apartment_management_system.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;
import com.arah.apartment_management_system.enums.NoticeType;

@Setter
@Getter
@Entity
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 3000)
    private String description;

    private String month;

    private Integer year;

    private String attachmentUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private NoticeType type = NoticeType.NOTICE;

    // Event-specific fields
    private LocalDateTime eventDate;

    private String eventLocation;

    private Boolean rsvpEnabled = false;
    
    @jakarta.persistence.Transient
    private Long rsvpCount;

    @jakarta.persistence.Transient
    private Boolean userHasRsvped = false;

    private LocalDateTime createdAt;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @jakarta.persistence.JoinColumn(name = "apartment_id")
    private Apartment apartment;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}