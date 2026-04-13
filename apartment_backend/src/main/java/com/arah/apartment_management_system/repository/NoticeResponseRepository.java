package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.arah.apartment_management_system.entity.NoticeResponse;
import java.util.List;
import java.util.Optional;

public interface NoticeResponseRepository extends JpaRepository<NoticeResponse, Long> {
    List<NoticeResponse> findByNoticeIdOrderByCreatedAtDesc(Long noticeId);

    Optional<NoticeResponse> findByNoticeIdAndResidentUsernameAndIsRsvp(Long noticeId, String username, boolean isRsvp);

    boolean existsByNoticeIdAndResidentUsernameAndIsRsvp(Long noticeId, String username, boolean isRsvp);

    long countByNoticeIdAndIsRsvp(Long noticeId, boolean isRsvp);
}
