package com.arah.apartment_management_system.entity;

import com.arah.apartment_management_system.enums.PaymentMethod;
import com.arah.apartment_management_system.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(
    uniqueConstraints = @UniqueConstraint(columnNames = {"flat_id", "month", "year"})
)
@Setter
@Getter
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int month;
    private int year;

    @Column(nullable = false)
    private Double amount;

    private LocalDate dueDate;
    private LocalDate paidDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String receiptUrl;

    @ManyToOne
    @JoinColumn(name = "flat_id", nullable = false)
    private Flat flat;
    
}