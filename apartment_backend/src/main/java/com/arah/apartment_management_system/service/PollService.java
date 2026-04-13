package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.poll.CreatePollRequest;
import com.arah.apartment_management_system.dto.poll.PollResponse;
import com.arah.apartment_management_system.dto.poll.PollResultResponse;

public interface PollService {

    void createPoll(CreatePollRequest request, String username);

    void vote(Long pollId, Long optionId, String username);

    List<PollResponse> getActivePolls();

    List<PollResponse> getAllPolls(String status);
    
    List<PollResponse> getPollsForResident(String username, String status);

    PollResultResponse getPollResults(Long pollId);
    
    void deletePoll(Long pollId);
}
