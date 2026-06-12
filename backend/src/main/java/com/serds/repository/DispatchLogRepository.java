package com.serds.repository;

import com.serds.entity.DispatchLog;
import com.serds.enums.DispatchAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispatchLogRepository extends JpaRepository<DispatchLog, Long> {
    List<DispatchLog> findByRequestIdOrderByCreatedAtDesc(Long requestId);
    List<DispatchLog> findByAction(DispatchAction action);
    List<DispatchLog> findByPerformedByIdOrderByCreatedAtDesc(Long userId);
}
