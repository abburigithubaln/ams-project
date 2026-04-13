package com.arah.apartment_management_system.dto.security;

import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.VisitorStatus;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorDTO {
    private Long id;
    private String name;
    private String phone;
    private String flatNumber;
    private String purpose;
    private VisitorStatus status;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private String otp;
    private boolean isPreApproved;
}
