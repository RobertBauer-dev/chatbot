package com.chatbot.session.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMessage {
    
    private String messageId;
    private String content;
    private MessageType type;
    private String sender;
    private LocalDateTime timestamp;
    private String intent;
    private Double confidence;
    private Map<String, Object> entities;

    public enum MessageType {
        USER, BOT, SYSTEM
    }

    public ConversationMessage(String content, MessageType type, String sender) {
        this.content = content;
        this.type = type;
        this.sender = sender;
        this.timestamp = LocalDateTime.now();
    }
}
