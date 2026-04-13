package com.arah.apartment_management_system.dto.poll;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptionResult {
    private String optionText;
    private int voteCount;
}
