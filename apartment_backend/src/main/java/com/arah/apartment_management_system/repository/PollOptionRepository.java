package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.arah.apartment_management_system.entity.PollOption;

public interface PollOptionRepository extends JpaRepository<PollOption, Long>{
	@Modifying
    @Query("UPDATE PollOption p SET p.voteCount = p.voteCount + 1 WHERE p.id = :optionId")
    void incrementVoteCount(@Param("optionId") Long optionId);
}
