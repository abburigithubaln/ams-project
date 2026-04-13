package com.arah.apartment_management_system.service;

import java.util.List;

import com.arah.apartment_management_system.dto.notice.NoticeResponseDTO;
import com.arah.apartment_management_system.entity.Notice;
import com.arah.apartment_management_system.entity.User;

public interface NoticeService {

	public List<Notice> getAllNotices();

	public List<Notice> getAllNotices(String username);

	public Notice createNotice(Notice notice);

	public void deleteNotice(Long id, User requestingUser);

	public void deleteNotice(Long id);

	public List<NoticeResponseDTO> getNoticeResponses(Long noticeId);

	public void addNoticeResponse(Long noticeId, String responseText, String username);

	public void rsvpForEvent(Long noticeId, String username);

	public long getRsvpCount(Long noticeId);
}
