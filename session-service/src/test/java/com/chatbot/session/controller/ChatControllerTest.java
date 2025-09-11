package com.chatbot.session.controller;

import com.chatbot.session.dto.ChatRequest;
import com.chatbot.session.dto.ChatResponse;
import com.chatbot.session.service.ChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private ChatService chatService;

    @InjectMocks
    private ChatController chatController;

    @Test
    void testSendMessageSuccess() {
        // Given
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");
        request.setUserId("user123");
        
        ChatResponse response = new ChatResponse(
                "session123",
                "msg123",
                "Hello! How can I help you?",
                "greeting",
                0.95,
                Map.of(),
                LocalDateTime.now(),
                List.of("Help", "What can you do?")
        );
        
        when(chatService.processMessage(any(ChatRequest.class), anyString()))
                .thenReturn(Mono.just(response));

        // When
        Mono<ResponseEntity<ChatResponse>> result = chatController.sendMessage(request, "user123");

        // Then
        StepVerifier.create(result)
                .expectNext(entity -> 
                    entity.getStatusCode() == HttpStatus.OK &&
                    entity.getBody().getResponse().equals("Hello! How can I help you?")
                )
                .verifyComplete();
    }

    @Test
    void testSendMessageError() {
        // Given
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");
        request.setUserId("user123");
        
        when(chatService.processMessage(any(ChatRequest.class), anyString()))
                .thenReturn(Mono.error(new RuntimeException("Service error")));

        // When
        Mono<ResponseEntity<ChatResponse>> result = chatController.sendMessage(request, "user123");

        // Then
        StepVerifier.create(result)
                .expectNext(entity -> entity.getStatusCode() == HttpStatus.INTERNAL_SERVER_ERROR)
                .verifyComplete();
    }

    @Test
    void testSendMessagePublic() {
        // Given
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");
        
        ChatResponse response = new ChatResponse(
                "session123",
                "msg123",
                "Hello! How can I help you?",
                "greeting",
                0.95,
                Map.of(),
                LocalDateTime.now(),
                List.of("Help", "What can you do?")
        );
        
        when(chatService.processMessage(any(ChatRequest.class), anyString()))
                .thenReturn(Mono.just(response));

        // When
        Mono<ResponseEntity<ChatResponse>> result = chatController.sendMessagePublic(request);

        // Then
        StepVerifier.create(result)
                .expectNext(entity -> entity.getStatusCode() == HttpStatus.OK)
                .verifyComplete();
    }
}
