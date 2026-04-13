package com.arah.apartment_management_system.dto.feedback;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateFeedbackRequest {

    @NotBlank(message = "Type is required (FEEDBACK or SUPPORT)")
    private String type;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;
}
