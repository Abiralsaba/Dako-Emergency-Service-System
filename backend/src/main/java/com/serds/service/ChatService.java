package com.serds.service;

import com.serds.entity.BaseUser;
import com.serds.entity.ChatMessage;
import com.serds.entity.EmergencyRequest;
import com.serds.enums.MessageType;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.ChatMessageRepository;
import com.serds.repository.EmergencyRepository;
import com.serds.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Real-time chat between citizen and responder during an active emergency
@Service
@Transactional
public class ChatService {

    private final ChatMessageRepository chatRepo;
    private final EmergencyRepository emergencyRepo;
    private final UserRepository userRepo;

    public ChatService(ChatMessageRepository chatRepo, EmergencyRepository emergencyRepo,
                       UserRepository userRepo) {
        this.chatRepo = chatRepo;
        this.emergencyRepo = emergencyRepo;
        this.userRepo = userRepo;
    }

    // Send a message within an emergency conversation
    public ChatMessage sendMessage(Long requestId, Long senderId, String text, MessageType type) {
        EmergencyRequest request = emergencyRepo.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Emergency #" + requestId + " not found"));

        BaseUser sender = userRepo.findById(senderId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ChatMessage message = new ChatMessage();
        message.setRequest(request);
        message.setSender(sender);
        message.setMessageText(text);
        message.setMessageType(type != null ? type : MessageType.TEXT);
        return chatRepo.save(message);
    }

    // Get all messages for an emergency, oldest first
    public List<ChatMessage> getConversation(Long requestId) {
        return chatRepo.findByRequestIdOrderByCreatedAtAsc(requestId);
    }

    // Mark all messages from the other party as read
    public void markAsRead(Long requestId, Long readerId) {
        List<ChatMessage> unread = chatRepo.findByRequestIdAndIsReadFalseAndSenderIdNot(requestId, readerId);
        for (ChatMessage msg : unread) {
            msg.setIsRead(true);
        }
        chatRepo.saveAll(unread);
    }

    // How many unread messages the user has in this emergency
    public long getUnreadCount(Long requestId, Long userId) {
        return chatRepo.countByRequestIdAndIsReadFalseAndSenderIdNot(requestId, userId);
    }
}
