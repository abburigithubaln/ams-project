package com.arah.apartment_management_system.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.feedback.AdminRespondRequest;
import com.arah.apartment_management_system.dto.feedback.CreateFeedbackRequest;
import com.arah.apartment_management_system.dto.feedback.FeedbackResponseDTO;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Feedback;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.FeedbackRepository;
import com.arah.apartment_management_system.service.FeedbackService;
import com.arah.apartment_management_system.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final AllotmentRepository allotmentRepository;
    private final UserService userService;

    @Override
    public FeedbackResponseDTO createFeedback(CreateFeedbackRequest request) {
        User user = userService.getLoggedInUser();

        Flat flat = allotmentRepository
                .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                .map(Allotment::getFlat)
                .orElse(null);

        Feedback feedback = new Feedback();
        feedback.setType(request.getType() != null ? request.getType().toUpperCase() : "FEEDBACK");
        feedback.setTitle(request.getTitle());
        feedback.setDescription(request.getDescription());
        feedback.setStatus("PENDING");
        feedback.setUser(user);
        feedback.setFlat(flat);

        if (flat != null && flat.getBlock() != null) {
            feedback.setApartment(flat.getBlock().getApartment());
        } else if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_RESIDENT) {
            allotmentRepository.findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                    .ifPresent(a -> feedback.setApartment(a.getFlat().getBlock().getApartment()));
        }

        return toDTO(feedbackRepository.save(feedback));
    }

    @Override
    public List<FeedbackResponseDTO> getMyFeedbacks() {
        User user = userService.getLoggedInUser();
        return feedbackRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponseDTO> getAllFeedbacks() {
        User user = userService.getLoggedInUser();
        List<Feedback> feedbacks;

        if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            feedbacks = feedbackRepository.findAllByOrderByCreatedAtDesc();
        } else if (user.getManagedApartment() != null) {
            feedbacks = feedbackRepository.findByApartmentIdOrderByCreatedAtDesc(user.getManagedApartment().getId());
        } else {
            feedbacks = List.of();
        }

        return feedbacks.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponseDTO> getFeedbacksByType(String type) {
        User user = userService.getLoggedInUser();
        List<Feedback> feedbacks;

        if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            feedbacks = feedbackRepository.findByTypeOrderByCreatedAtDesc(type.toUpperCase());
        } else if (user.getManagedApartment() != null) {
            feedbacks = feedbackRepository.findByApartmentIdAndTypeOrderByCreatedAtDesc(
                    user.getManagedApartment().getId(), type.toUpperCase());
        } else {
            feedbacks = List.of();
        }

        return feedbacks.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FeedbackResponseDTO respondToFeedback(Long id, AdminRespondRequest request) {
        User admin = userService.getLoggedInUser();
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        if (admin.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                admin.getManagedApartment() != null &&
                feedback.getApartment() != null &&
                !admin.getManagedApartment().getId().equals(feedback.getApartment().getId())) {
            throw new RuntimeException("Unauthorized: This feedback does not belong to your apartment.");
        }

        feedback.setAdminResponse(request.getAdminResponse());
        feedback.setRespondedAt(LocalDateTime.now());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            feedback.setStatus(request.getStatus().toUpperCase());
        } else {
            feedback.setStatus("ACKNOWLEDGED");
        }

        return toDTO(feedbackRepository.save(feedback));
    }

    @Override
    public void deleteFeedback(Long id) {
        User admin = userService.getLoggedInUser();
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        if (admin.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                admin.getManagedApartment() != null &&
                feedback.getApartment() != null &&
                !admin.getManagedApartment().getId().equals(feedback.getApartment().getId())) {
            throw new RuntimeException("Unauthorized: This feedback does not belong to your apartment.");
        }

        feedbackRepository.delete(feedback);
    }

    private FeedbackResponseDTO toDTO(Feedback f) {
        return FeedbackResponseDTO.builder()
                .id(f.getId())
                .type(f.getType())
                .title(f.getTitle())
                .description(f.getDescription())
                .status(f.getStatus())
                .adminResponse(f.getAdminResponse())
                .userId(f.getUser() != null ? f.getUser().getId() : null)
                .username(f.getUser() != null ? f.getUser().getUsername() : null)
                .flatId(f.getFlat() != null ? f.getFlat().getId() : null)
                .flatNumber(f.getFlat() != null ? f.getFlat().getFlatNumber() : null)
                .createdAt(f.getCreatedAt())
                .respondedAt(f.getRespondedAt())
                .build();
    }
}
