package com.arah.apartment_management_system.dto.poll;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePollRequest {

    @NotBlank
    private String question;

    @NotNull
    private LocalDate endDate;

    @Size(min = 2, message = "Poll must contain at least 2 options")
    private List<String> options;
}