package com.arah.apartment_management_system.service.impl;

import com.arah.apartment_management_system.dto.poll.CreatePollRequest;
import com.arah.apartment_management_system.dto.poll.OptionResult;
import com.arah.apartment_management_system.dto.poll.PollResponse;
import com.arah.apartment_management_system.dto.poll.PollResultResponse;
import com.arah.apartment_management_system.entity.Poll;
import com.arah.apartment_management_system.entity.PollOption;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.entity.Vote;
import com.arah.apartment_management_system.enums.PollStatus;
import com.arah.apartment_management_system.exception.BadRequestException;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.mapper.PollMapper;
import com.arah.apartment_management_system.repository.PollOptionRepository;
import com.arah.apartment_management_system.repository.PollRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.repository.VoteRepository;
import com.arah.apartment_management_system.service.PollService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollServiceImpl implements PollService {

    private final UserRepository userRepository;
    private final PollRepository pollRepository;
    private final VoteRepository voteRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollMapper pollMapper;
    private final com.arah.apartment_management_system.service.UserService userService;

    private Long getApartmentIdForUser(User user) {
        if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_ADMIN
                || user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SECURITY) {
            return user.getManagedApartment() != null ? user.getManagedApartment().getId() : null;
        } else if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_RESIDENT) {
            return user.getAllotments().stream()
                    .findFirst()
                    .map(a -> a.getFlat().getBlock().getApartment().getId())
                    .orElse(null);
        }
        return null;
    }

    @Transactional
    public void createPoll(CreatePollRequest request, String username) {
        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new BadRequestException("Poll must have at least 2 options");
        }

        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Poll poll = new Poll();
        poll.setQuestion(request.getQuestion());
        poll.setEndDate(request.getEndDate());
        poll.setCreatedBy(admin);
        poll.setStatus(PollStatus.ACTIVE);

        if (admin.getManagedApartment() != null) {
            poll.setApartment(admin.getManagedApartment());
        }

        List<PollOption> pollOptions = request.getOptions().stream().map(optionText -> {
            PollOption option = new PollOption();
            option.setOptionText(optionText);
            option.setPoll(poll);
            return option;
        }).collect(Collectors.toList());
        poll.setOptions(pollOptions);

        pollRepository.save(poll);
    }

    @Transactional
    public void vote(Long pollId, Long optionId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        if (poll.getStatus() != PollStatus.ACTIVE) {
            throw new BadRequestException("Poll is closed");
        }

        Long userAptId = getApartmentIdForUser(user);
        if (user.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                poll.getApartment() != null &&
                (userAptId == null || !userAptId.equals(poll.getApartment().getId()))) {
            throw new RuntimeException("Unauthorized: You cannot vote on this poll.");
        }

        if (poll.getEndDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Poll expired");
        }

        if (voteRepository.existsByUserAndPoll(user, poll)) {
            throw new BadRequestException("You already voted");
        }

        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Option not found"));

        Vote vote = new Vote();
        vote.setUser(user);
        vote.setPoll(poll);
        vote.setOption(option);

        voteRepository.save(vote);
        pollOptionRepository.incrementVoteCount(optionId);
    }

    @Override
    @Transactional
    public List<PollResponse> getActivePolls() {
        User user = userService.getLoggedInUser();
        Long aptId = getApartmentIdForUser(user);

        List<Poll> polls;
        if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            polls = pollRepository.findAll().stream()
                    .filter(p -> p.getStatus() == PollStatus.ACTIVE
                            && p.getEndDate().isAfter(LocalDate.now().minusDays(1)))
                    .toList();
        } else if (aptId != null) {
            polls = pollRepository.findActivePolls(LocalDate.now(), aptId);
        } else {
            polls = List.of();
        }

        return polls.stream()
                .map(pollMapper::toPollResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<PollResponse> getAllPolls(String status) {
        User user = userService.getLoggedInUser();
        Long aptId = getApartmentIdForUser(user);

        List<Poll> polls;
        if (user.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
            polls = pollRepository.findAll();
        } else if (aptId != null) {
            if ("ACTIVE".equalsIgnoreCase(status)) {
                polls = pollRepository.findActivePolls(LocalDate.now(), aptId);
            } else if ("CLOSED".equalsIgnoreCase(status)) {
                polls = pollRepository.findClosedPolls(LocalDate.now(), aptId);
            } else {
                polls = pollRepository.findByApartmentId(aptId);
            }
        } else {
            polls = List.of();
        }

        return polls.stream()
                .map(pollMapper::toPollResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<PollResponse> getPollsForResident(String username, String status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Long aptId = getApartmentIdForUser(user);

        List<Poll> polls;
        if (aptId != null) {
            if ("ACTIVE".equalsIgnoreCase(status)) {
                polls = pollRepository.findActivePolls(LocalDate.now(), aptId);
            } else if ("CLOSED".equalsIgnoreCase(status)) {
                polls = pollRepository.findClosedPolls(LocalDate.now(), aptId);
            } else {
                polls = pollRepository.findByApartmentId(aptId);
            }
        } else {
            polls = List.of();
        }

        return polls.stream()
                .map(poll -> {
                    boolean hasVoted = voteRepository.existsByUserAndPoll(user, poll);
                    return pollMapper.toPollResponse(poll, hasVoted);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PollResultResponse getPollResults(Long pollId) {
        User user = userService.getLoggedInUser();
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        Long userAptId = getApartmentIdForUser(user);
        if (user.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                poll.getApartment() != null &&
                (userAptId == null || !userAptId.equals(poll.getApartment().getId()))) {
            throw new RuntimeException("Unauthorized: This poll does not belong to your apartment.");
        }

        List<OptionResult> results = pollMapper.toOptionResults(poll);

        PollResultResponse response = new PollResultResponse();
        response.setQuestion(poll.getQuestion());
        response.setResults(results);

        return response;
    }

    @Override
    @Transactional
    public void deletePoll(Long pollId) {
        User user = userService.getLoggedInUser();
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        Long userAptId = getApartmentIdForUser(user);
        if (user.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN &&
                poll.getApartment() != null &&
                (userAptId == null || !userAptId.equals(poll.getApartment().getId()))) {
            throw new RuntimeException("Unauthorized: This poll does not belong to your apartment.");
        }

        pollRepository.delete(poll);
    }
}
