package com.serds.repository;

import com.serds.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRequestIdOrderByCreatedAtAsc(Long requestId);
    List<ChatMessage> findByRequestIdAndIsReadFalseAndSenderIdNot(Long requestId, Long userId);
    long countByRequestIdAndIsReadFalseAndSenderIdNot(Long requestId, Long userId);
}
