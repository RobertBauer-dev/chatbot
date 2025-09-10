package com.chatbot.session.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sessions")
public class Session {
    
    @Id
    private String sessionId;
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime lastActivity;
    private SessionStatus status;
    private Map<String, Object> context;
    private List<ConversationMessage> messages;
    private String currentIntent;
    private Map<String, Object> entities;

    public Session(String sessionId, String userId) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now();
        this.status = SessionStatus.ACTIVE;
        this.messages = new ArrayList<>();
        this.context = Map.of();
        this.entities = Map.of();
    }

    public void addMessage(ConversationMessage message) {
        this.messages.add(message);
        this.lastActivity = LocalDateTime.now();
    }

    public enum SessionStatus {
        ACTIVE, INACTIVE, EXPIRED, TERMINATED
    }
}
