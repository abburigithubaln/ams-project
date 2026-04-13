package com.arah.apartment_management_system.mapper;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.entity.Maintenance;
import com.arah.apartment_management_system.enums.PaymentStatus;

@Component
public class MaintenanceMapper {

    public MaintenanceResponseDTO toDTO(Maintenance maintenance) {

        double interest = 0;

        if (maintenance.getPaymentStatus() == PaymentStatus.PENDING &&
                LocalDate.now().isAfter(maintenance.getDueDate())) {

            interest = maintenance.getAmount() * 0.05; // 5% basic interest
        }

        if (LocalDate.now().isAfter(maintenance.getDueDate())
                && maintenance.getPaymentStatus() == PaymentStatus.PENDING) {

            maintenance.setPaymentStatus(PaymentStatus.OVERDUE);
        }

        double totalAmount = maintenance.getAmount() + interest;

        return new MaintenanceResponseDTO(
                maintenance.getId(),
                maintenance.getMonth(),
                maintenance.getYear(),
                maintenance.getAmount(),
                maintenance.getDueDate(),
                maintenance.getPaidDate(),
                maintenance.getPaymentStatus(),
                maintenance.getPaymentMethod(),
                maintenance.getFlat().getId(),
                maintenance.getFlat().getFlatNumber(),
                interest,
                totalAmount,
                maintenance.getReceiptUrl());
    }
}