package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.dto.poll.CreatePollRequest;
import com.arah.apartment_management_system.dto.poll.PollResponse;
import com.arah.apartment_management_system.dto.poll.PollResultResponse;
import com.arah.apartment_management_system.service.PollService;
import com.arah.apartment_management_system.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PollController {

    private final PollService pollService;

    @PostMapping("/admin/polls")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> createPoll(
            @Valid @RequestBody CreatePollRequest request,
            Authentication authentication) {

        pollService.createPoll(request, authentication.getName());

        return ApiResponse.success("Poll created successfully", null);
    }

    @PostMapping("/user/polls/{pollId}/vote/{optionId}")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<String> vote(
            @PathVariable Long pollId,
            @PathVariable Long optionId,
            Authentication authentication) {

        pollService.vote(pollId, optionId, authentication.getName());

        return ApiResponse.success("Vote submitted successfully", null);
    }

    @GetMapping("/admin/polls")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PollResponse>> getAllPolls(@RequestParam(required = false) String status) {
        return ApiResponse.success(null, pollService.getAllPolls(status));
    }

    @GetMapping("/user/polls")
    @PreAuthorize("hasRole('RESIDENT')")
    public ApiResponse<List<PollResponse>> getPollsForResident(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        return ApiResponse.success(null, pollService.getPollsForResident(authentication.getName(), status));
    }

    @GetMapping("/user/polls/{pollId}/results")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESIDENT')")
    public ApiResponse<PollResultResponse> getPollResults(@PathVariable Long pollId) {
        return ApiResponse.success(null, pollService.getPollResults(pollId));
    }

    @DeleteMapping("/admin/polls/{pollId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deletePoll(@PathVariable Long pollId) {
        pollService.deletePoll(pollId);
        return ApiResponse.success("Poll deleted successfully", null);
    }
}