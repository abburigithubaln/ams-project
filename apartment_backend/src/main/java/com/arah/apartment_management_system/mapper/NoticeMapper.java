package com.arah.apartment_management_system.mapper;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.notice.NoticeResponseDTO;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.NoticeResponse;
import com.arah.apartment_management_system.entity.User;

@Component
public class NoticeMapper {

    public NoticeResponseDTO toNoticeResponseDTO(NoticeResponse response) {

        User resident = response.getResident();

        String flatNumber = "N/A";

        if (resident != null && resident.getAllotments() != null && !resident.getAllotments().isEmpty()) {

            for (Allotment allotment : resident.getAllotments()) {

                if (allotment.getFlat() != null) {
                    flatNumber = allotment.getFlat().getFlatNumber();
                    break;
                }
            }
        }

        return NoticeResponseDTO.builder()
                .id(response.getId())
                .noticeId(response.getNotice().getId())
                .residentName(resident != null ? resident.getUsername() : "Unknown")
                .flatNumber(flatNumber)
                .responseText(response.getResponseText())
                .createdAt(response.getCreatedAt())
                .build();
    }
}