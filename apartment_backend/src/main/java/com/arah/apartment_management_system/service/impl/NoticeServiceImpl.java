package com.arah.apartment_management_system.service.impl;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.dto.notice.NoticeResponseDTO;
import com.arah.apartment_management_system.entity.Notice;
import com.arah.apartment_management_system.entity.NoticeResponse;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.NoticeRepository;
import com.arah.apartment_management_system.repository.NoticeResponseRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.service.NoticeService;
import com.arah.apartment_management_system.mapper.NoticeMapper;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {
	private final NoticeRepository noticeRepository;
	private final NoticeResponseRepository noticeResponseRepository;
	private final UserRepository userRepository;
	private final com.arah.apartment_management_system.service.UserService userService;
	private final NoticeMapper noticeMapper;

	@Override
	public List<Notice> getAllNotices() {
		return getAllNotices(null);
	}

	@Override
	public List<Notice> getAllNotices(String username) {
		User loggedInUser = userService.getLoggedInUser();
		User contextUser = userRepository.findById(loggedInUser.getId())
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		List<Notice> notices;

		if (contextUser.getRole() == com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
			notices = noticeRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
		} else {
			Long apartmentId = contextUser.getManagedApartment() != null
					? contextUser.getManagedApartment().getId()
					: contextUser.getAllotments().stream()
							.filter(a -> a
									.getStatus() == com.arah.apartment_management_system.enums.AllotmentStatus.ACTIVE)
							.findFirst()
							.map(a -> a.getFlat().getBlock().getApartment().getId())
							.orElse(null);

			if (apartmentId != null) {
				notices = noticeRepository.findByApartmentIdOrderByIdDesc(apartmentId);
			} else {
				notices = List.of();
			}
		}

		notices.forEach(notice -> {
			if (Boolean.TRUE.equals(notice.getRsvpEnabled())) {
				notice.setRsvpCount(noticeResponseRepository.countByNoticeIdAndIsRsvp(notice.getId(), true));
				if (username != null) {
					notice.setUserHasRsvped(noticeResponseRepository
							.existsByNoticeIdAndResidentUsernameAndIsRsvp(notice.getId(), username, true));
				}
			}
		});
		return notices;
	}

	@Override
	public Notice createNotice(Notice notice) {
		User admin = userService.getLoggedInUser();
		if (admin.getManagedApartment() != null) {
			notice.setApartment(admin.getManagedApartment());
		} else if (admin.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
			throw new RuntimeException(
					"Notice publication failed: No society/apartment assigned to your account. Please contact the Super Admin.");
		}
		return noticeRepository.save(notice);
	}

	@Override
	public void deleteNotice(Long id, User requestingUser) {
		Notice notice = noticeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Notice not found"));

		if (requestingUser.getRole() != com.arah.apartment_management_system.enums.Role.ROLE_SUPER_ADMIN) {
			Long adminAptId = requestingUser.getManagedApartment() != null
					? requestingUser.getManagedApartment().getId()
					: null;
			Long noticeAptId = notice.getApartment() != null ? notice.getApartment().getId() : null;

			if (adminAptId == null || !adminAptId.equals(noticeAptId)) {
				throw new RuntimeException(
						"Unauthorized: You can only delete notices belonging to your apartment.");
			}
		}

		noticeRepository.delete(notice);
	}

	@Override
	public void deleteNotice(Long id) {
		noticeRepository.deleteById(id);
	}

	@Override
	public List<NoticeResponseDTO> getNoticeResponses(Long noticeId) {
		List<NoticeResponse> responses = noticeResponseRepository.findByNoticeIdOrderByCreatedAtDesc(noticeId);
		return responses.stream().map(noticeMapper::toNoticeResponseDTO).collect(Collectors.toList());
	}

	@Override
	public void rsvpForEvent(Long noticeId, String username) {
		Notice notice = noticeRepository.findById(noticeId)
				.orElseThrow(() -> new ResourceNotFoundException("Notice not found"));
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		noticeResponseRepository.findByNoticeIdAndResidentUsernameAndIsRsvp(noticeId, username, true)
				.ifPresentOrElse(
						noticeResponseRepository::delete,
						() -> {
							NoticeResponse rsvp = NoticeResponse.builder()
									.notice(notice)
									.resident(user)
									.responseText("RSVP")
									.isRsvp(true)
									.build();
							noticeResponseRepository.save(rsvp);
						});
	}

	@Override
	public long getRsvpCount(Long noticeId) {
		return noticeResponseRepository.countByNoticeIdAndIsRsvp(noticeId, true);
	}

	@Override
	public void addNoticeResponse(Long noticeId, String responseText, String username) {
		Notice notice = noticeRepository.findById(noticeId)
				.orElseThrow(() -> new ResourceNotFoundException("Notice not found"));
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		NoticeResponse response = NoticeResponse.builder()
				.notice(notice)
				.resident(user)
				.responseText(responseText)
				.build();
		noticeResponseRepository.save(response);
	}

}
