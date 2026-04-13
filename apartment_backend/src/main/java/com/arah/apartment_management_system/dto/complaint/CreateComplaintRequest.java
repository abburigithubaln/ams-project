package com.arah.apartment_management_system.dto.complaint;

import com.arah.apartment_management_system.enums.ComplaintPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateComplaintRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String category;

    private ComplaintPriority priority;

    private String imageUrl;
}
