package com.arah.apartment_management_system.dto.notice;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeResponseDTO {
    private Long id;
    private Long noticeId;
    private String residentName;
    private String flatNumber;
    private String responseText;
    private LocalDateTime createdAt;
}
