package com.arah.apartment_management_system.dto.feedback;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminRespondRequest {

    @NotBlank(message = "Response cannot be empty")
    private String adminResponse;

    private String status; // e.g. ACKNOWLEDGED, RESOLVED, CLOSED
}
