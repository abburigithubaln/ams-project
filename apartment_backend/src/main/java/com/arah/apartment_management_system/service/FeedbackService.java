package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.feedback.AdminRespondRequest;
import com.arah.apartment_management_system.dto.feedback.CreateFeedbackRequest;
import com.arah.apartment_management_system.dto.feedback.FeedbackResponseDTO;

public interface FeedbackService {

    FeedbackResponseDTO createFeedback(CreateFeedbackRequest request);

    List<FeedbackResponseDTO> getMyFeedbacks();

    List<FeedbackResponseDTO> getAllFeedbacks();

    List<FeedbackResponseDTO> getFeedbacksByType(String type);

    FeedbackResponseDTO respondToFeedback(Long id, AdminRespondRequest request);

    void deleteFeedback(Long id);
}
