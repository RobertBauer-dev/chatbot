package com.chatbot.session.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ChatRequest {
    
    @NotBlank(message = "Message content is required")
    private String message;
    
    private String sessionId;
    private String userId;
    private Map<String, Object> context;
}
