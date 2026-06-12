package com.serds.controller;

import com.serds.entity.ChatMessage;
import com.serds.enums.MessageType;
import com.serds.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Chat — real-time messages between citizen and responder during an emergency
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/emergency/{requestId}/send")
    public ResponseEntity<ChatMessage> sendMessage(@PathVariable Long requestId,
                                                    @RequestBody Map<String, String> body) {
        Long senderId = Long.parseLong(body.get("senderId"));
        String text = body.get("text");
        MessageType type = body.containsKey("type") ? MessageType.valueOf(body.get("type")) : MessageType.TEXT;
        return ResponseEntity.ok(chatService.sendMessage(requestId, senderId, text, type));
    }

    @GetMapping("/emergency/{requestId}")
    public ResponseEntity<List<ChatMessage>> getConversation(@PathVariable Long requestId) {
        return ResponseEntity.ok(chatService.getConversation(requestId));
    }

    @PutMapping("/emergency/{requestId}/read/{userId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long requestId, @PathVariable Long userId) {
        chatService.markAsRead(requestId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/emergency/{requestId}/unread/{userId}")
    public ResponseEntity<Map<String, Long>> getUnread(@PathVariable Long requestId, @PathVariable Long userId) {
        long count = chatService.getUnreadCount(requestId, userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}
