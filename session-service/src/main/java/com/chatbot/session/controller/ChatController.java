package com.chatbot.session.controller;

import com.chatbot.session.dto.ChatRequest;
import com.chatbot.session.dto.ChatResponse;
import com.chatbot.session.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/message")
    public Mono<ResponseEntity<ChatResponse>> sendMessage(
            @Valid @RequestBody ChatRequest request,
            @RequestHeader("X-User-Id") String userId) {
        
        log.info("Received chat message from user: {}", userId);
        
        return chatService.processMessage(request, userId)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.status(500).build());
    }

    @PostMapping("/message/public")
    public Mono<ResponseEntity<ChatResponse>> sendMessagePublic(
            @Valid @RequestBody ChatRequest request) {
        
        log.info("Received public chat message");
        
        // Use demo user for public access
        return chatService.processMessage(request, "demo")
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.status(500).build());
    }
}
