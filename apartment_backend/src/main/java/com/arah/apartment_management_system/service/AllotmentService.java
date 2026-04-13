package com.arah.apartment_management_system.service;

import com.arah.apartment_management_system.dto.allotment.*;
import java.util.List;

public interface AllotmentService {

    AllotmentResponseDTO createAllotment(AllotmentRequestDTO request);

    AllotmentResponseDTO getMyAllotment();

    void vacateFlat(Long allotmentId);

    List<AllotmentResponseDTO> getAllotmentHistory();
}
