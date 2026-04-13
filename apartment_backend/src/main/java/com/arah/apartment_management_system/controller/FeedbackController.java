package com.arah.apartment_management_system.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.feedback.AdminRespondRequest;
import com.arah.apartment_management_system.dto.feedback.CreateFeedbackRequest;
import com.arah.apartment_management_system.dto.feedback.FeedbackResponseDTO;
import com.arah.apartment_management_system.service.FeedbackService;
import com.arah.apartment_management_system.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/api/user/feedback")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<FeedbackResponseDTO> submitFeedback(
            @Valid @RequestBody CreateFeedbackRequest request) {
        return ApiResponse.success("Feedback submitted successfully", feedbackService.createFeedback(request));
    }

    @GetMapping("/api/user/feedback")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<List<FeedbackResponseDTO>> getMyFeedbacks() {
        return ApiResponse.success("Feedbacks fetched", feedbackService.getMyFeedbacks());
    }

    @GetMapping("/api/admin/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<FeedbackResponseDTO>> getAllFeedbacks() {
        return ApiResponse.success("All feedbacks fetched", feedbackService.getAllFeedbacks());
    }

    @GetMapping("/api/admin/feedback/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<FeedbackResponseDTO>> getFeedbacksByType(@PathVariable String type) {
        return ApiResponse.success("Feedbacks fetched by type", feedbackService.getFeedbacksByType(type));
    }

    @PutMapping("/api/admin/feedback/{id}/respond")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FeedbackResponseDTO> respondToFeedback(
            @PathVariable Long id,
            @Valid @RequestBody AdminRespondRequest request) {
        return ApiResponse.success("Response saved successfully", feedbackService.respondToFeedback(id, request));
    }

    @DeleteMapping("/api/admin/feedback/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ApiResponse.success("Feedback deleted", null);
    }
}
