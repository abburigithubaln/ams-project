package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.Poll;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.entity.Vote;

public interface VoteRepository extends JpaRepository<Vote, Long>{
	boolean existsByUserAndPoll(User user, Poll poll);
}
