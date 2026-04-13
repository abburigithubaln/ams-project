package com.arah.apartment_management_system.dto.security;

import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.ParcelStatus;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParcelDTO {
    private Long id;
    private String recipientName;
    private String flatNumber;
    private String courier;
    private String trackingNumber;
    private ParcelStatus status;
    private LocalDateTime receivedTime;
    private LocalDateTime collectedTime;
}
