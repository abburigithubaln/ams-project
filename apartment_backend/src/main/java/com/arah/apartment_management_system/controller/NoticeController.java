package com.arah.apartment_management_system.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.notice.NoticeResponseDTO;
import com.arah.apartment_management_system.entity.Notice;
import com.arah.apartment_management_system.service.NoticeService;
import com.arah.apartment_management_system.service.UserService;
import com.arah.apartment_management_system.util.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class NoticeController {

	private final NoticeService noticeService;
	private final UserService userService;

	@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
	@GetMapping
	public ApiResponse<List<Notice>> getAllNotices() {
		return ApiResponse.success("Notices fetched successfully", noticeService.getAllNotices());
	}

	@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
	@PostMapping
	public ApiResponse<Notice> createNotice(@RequestBody Notice notice) {
		return ApiResponse.success("Notice created successfully", noticeService.createNotice(notice));
	}

	@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
	@DeleteMapping("/{id}")
	public ApiResponse<String> deleteNotice(@PathVariable Long id) {
		noticeService.deleteNotice(id, userService.getLoggedInUser());
		return ApiResponse.success("Notice deleted successfully", null);
	}

	@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
	@GetMapping("/{id}/responses")
	public ApiResponse<List<NoticeResponseDTO>> getNoticeResponses(@PathVariable Long id) {
		return ApiResponse.success("Notice responses fetched", noticeService.getNoticeResponses(id));
	}

	@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
	@GetMapping("/{id}/rsvp-count")
	public ApiResponse<Long> getRsvpCount(@PathVariable Long id) {
		return ApiResponse.success("RSVP count fetched", noticeService.getRsvpCount(id));
	}
}
