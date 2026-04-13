package com.arah.apartment_management_system.dto.poll;

import java.time.LocalDate;
import java.util.List;

import com.arah.apartment_management_system.enums.PollStatus;

import lombok.Data;

@Data
public class PollResponse {
    private Long id;
    private String question;
    private List<PollOptionDto> options;
    private LocalDate endDate;
    private PollStatus status;
    private boolean hasVoted;
}
