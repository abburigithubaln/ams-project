package com.arah.apartment_management_system.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.poll.OptionResult;
import com.arah.apartment_management_system.dto.poll.PollOptionDto;
import com.arah.apartment_management_system.dto.poll.PollResponse;
import com.arah.apartment_management_system.entity.Poll;

@Component
public class PollMapper {

    public PollResponse toPollResponse(Poll poll) {

        PollResponse response = new PollResponse();

        response.setId(poll.getId());
        response.setQuestion(poll.getQuestion());
        response.setEndDate(poll.getEndDate());
        response.setStatus(poll.getStatus());

        response.setOptions(
                poll.getOptions().stream()
                        .map(option -> new PollOptionDto(
                                option.getId(),
                                option.getOptionText(),
                                option.getVoteCount()))
                        .collect(Collectors.toList()));

        return response;
    }

    public PollResponse toPollResponse(Poll poll, boolean hasVoted) {
        PollResponse response = toPollResponse(poll);
        response.setHasVoted(hasVoted);
        return response;
    }

    public List<OptionResult> toOptionResults(Poll poll) {
        return poll.getOptions().stream()
                .map(option -> new OptionResult(
                        option.getOptionText(),
                        option.getVoteCount()))
                .collect(Collectors.toList());
    }
}