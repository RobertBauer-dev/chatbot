package com.chatbot.session.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class ChatResponse {
    
    private String sessionId;
    private String messageId;
    private String response;
    private String intent;
    private Double confidence;
    private Map<String, Object> entities;
    private LocalDateTime timestamp;
    private List<String> suggestions;
}
