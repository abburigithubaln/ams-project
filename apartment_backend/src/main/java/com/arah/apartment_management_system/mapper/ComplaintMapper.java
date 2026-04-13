package com.arah.apartment_management_system.mapper;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.complaint.ComplaintResponseDTO;
import com.arah.apartment_management_system.entity.Complaint;

@Component
public class ComplaintMapper {

    public ComplaintResponseDTO toDTO(Complaint complaint) {

        return ComplaintResponseDTO.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())

                .userId(complaint.getUser() != null ? complaint.getUser().getId() : null)
                .username(complaint.getUser() != null ? complaint.getUser().getUsername() : null)

                .flatId(complaint.getFlat() != null ? complaint.getFlat().getId() : null)
                .flatNumber(complaint.getFlat() != null ? complaint.getFlat().getFlatNumber() : null)

                .staffId(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getId() : null)
                .staffName(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getUsername() : null)
                .staffDesignation(
                        complaint.getAssignedStaff() != null
                                ? complaint.getAssignedStaff().getDesignation()
                                : null)

                .createdAt(complaint.getCreatedAt())
                .resolvedAt(complaint.getResolvedAt())
                .imageUrl(complaint.getImageUrl())

                .build();
    }
}