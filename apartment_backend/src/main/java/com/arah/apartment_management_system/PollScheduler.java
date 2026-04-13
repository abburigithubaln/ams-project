package com.arah.apartment_management_system;

import com.arah.apartment_management_system.repository.PollRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class PollScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PollScheduler.class);
    private final PollRepository pollRepository;

    @Scheduled(fixedRate = 12 * 60 * 60 * 1000)
    @Transactional
    public void closeExpiredPolls() {
        logger.info("Running job to close expired polls...");
        int updatedCount = pollRepository.closeExpiredPolls(LocalDate.now());
        logger.info("Closed {} expired polls.", updatedCount);
    }
}