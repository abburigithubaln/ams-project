package com.arah.apartment_management_system.dto.poll;

import java.util.List;

import lombok.Data;

@Data
public class PollResultResponse {
    private String question;
    private List<OptionResult> results;
}
