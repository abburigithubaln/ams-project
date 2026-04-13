package com.arah.apartment_management_system.entity;

import com.arah.apartment_management_system.enums.FlatStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String flatNumber;

    @Column(nullable = false)
    private Integer floorNumber;

    @Column(nullable = false)
    private String type;

    @Column(nullable = true)
    private String unitSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlatStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "block_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference("block-flats")
    private Block block;
}