package com.arah.apartment_management_system.dto.poll;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PollOptionDto {
    private Long id;
    private String text;
    private int voteCount;
}
