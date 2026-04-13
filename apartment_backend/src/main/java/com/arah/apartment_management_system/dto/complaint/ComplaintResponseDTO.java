package com.arah.apartment_management_system.dto.complaint;

import java.time.LocalDateTime;

import com.arah.apartment_management_system.enums.ComplaintPriority;
import com.arah.apartment_management_system.enums.ComplaintStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    private Long userId;
    private String username;
    private Long flatId;
    private String flatNumber;
    private Long staffId;
    private String staffName;
    private String staffDesignation;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String imageUrl;
}
