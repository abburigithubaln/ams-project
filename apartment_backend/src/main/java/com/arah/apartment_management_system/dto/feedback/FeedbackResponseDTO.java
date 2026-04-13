package com.arah.apartment_management_system.dto.feedback;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponseDTO {

    private Long id;
    private String type;
    private String title;
    private String description;
    private String status;
    private String adminResponse;
    private Long userId;
    private String username;
    private Long flatId;
    private String flatNumber;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
