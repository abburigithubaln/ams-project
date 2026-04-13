package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.complaint.ComplaintResponseDTO;
import com.arah.apartment_management_system.dto.complaint.CreateComplaintRequest;
import com.arah.apartment_management_system.enums.ComplaintStatus;

public interface ComplaintService {

    ComplaintResponseDTO createComplaint(CreateComplaintRequest request);

    List<ComplaintResponseDTO> getMyComplaints();

    List<ComplaintResponseDTO> getAllComplaints();

    ComplaintResponseDTO updateStatus(Long id, ComplaintStatus status);

    ComplaintResponseDTO assignStaff(Long complaintId, Long staffId);

    void deleteComplaint(Long id);
}
