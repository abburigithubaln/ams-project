package com.arah.apartment_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "blocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String blockName;

    @ManyToOne
    @JoinColumn(name = "apartment_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference("apartment-blocks")
    private Apartment apartment;

    @OneToMany(mappedBy = "block", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference("block-flats")
    private List<Flat> flats;
}