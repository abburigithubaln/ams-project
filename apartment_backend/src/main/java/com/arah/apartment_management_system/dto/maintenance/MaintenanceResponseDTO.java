package com.arah.apartment_management_system.dto.maintenance;

import java.time.LocalDate;

import com.arah.apartment_management_system.enums.PaymentMethod;
import com.arah.apartment_management_system.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceResponseDTO {

    private Long id;
    private int month;
    private int year;
    private Double amount;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private Long flatId;
    private String flatNumber;
    private double interest;
    private double totalAmount;
    private String receiptUrl;
}
