package com.chatbot.session.service;

import com.chatbot.session.dto.ChatRequest;
import com.chatbot.session.dto.ChatResponse;
import com.chatbot.session.model.ConversationMessage;
import com.chatbot.session.model.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final SessionService sessionService;
    private final WebClient.Builder webClientBuilder;

    @Value("${nlu.service.url:http://nlu-service:8000}")
    private String nluServiceUrl;

    public Mono<ChatResponse> processMessage(ChatRequest request, String userId) {
        log.info("Processing message from user: {} - {}", userId, request.getMessage());

        // Add user message to session
        ConversationMessage userMessage = new ConversationMessage(
                request.getMessage(), 
                ConversationMessage.MessageType.USER, 
                userId
        );
        
        Session session = sessionService.addMessageToSession(
                request.getSessionId(), userId, userMessage);

        // Call NLU service for intent classification
        return callNluService(request.getMessage())
                .flatMap(nluResponse -> {
                    // Create bot response
                    String botResponse = generateBotResponse(nluResponse.getIntent(), nluResponse.getConfidence());
                    
                    // Add bot message to session
                    ConversationMessage botMessage = new ConversationMessage(
                            botResponse,
                            ConversationMessage.MessageType.BOT,
                            "bot"
                    );
                    botMessage.setIntent(nluResponse.getIntent());
                    botMessage.setConfidence(nluResponse.getConfidence());
                    botMessage.setEntities(nluResponse.getEntities());
                    
                    sessionService.addMessageToSession(session.getSessionId(), userId, botMessage);

                    // Create response
                    ChatResponse response = new ChatResponse(
                            session.getSessionId(),
                            UUID.randomUUID().toString(),
                            botResponse,
                            nluResponse.getIntent(),
                            nluResponse.getConfidence(),
                            nluResponse.getEntities(),
                            LocalDateTime.now(),
                            generateSuggestions(nluResponse.getIntent())
                    );

                    return Mono.just(response);
                });
    }

    private Mono<NluResponse> callNluService(String message) {
        WebClient webClient = webClientBuilder.baseUrl(nluServiceUrl).build();
        
        NluRequest nluRequest = new NluRequest(message);
        
        return webClient.post()
                .uri("/api/nlu/classify")
                .bodyValue(nluRequest)
                .retrieve()
                .bodyToMono(NluResponse.class)
                .doOnError(error -> log.error("Error calling NLU service", error))
                .onErrorReturn(new NluResponse("unknown", 0.0, Map.of()));
    }

    private String generateBotResponse(String intent, Double confidence) {
        return switch (intent) {
            case "greeting" -> "Hello! How can I help you today?";
            case "goodbye" -> "Goodbye! Have a great day!";
            case "help" -> "I can help you with various tasks. What would you like to know?";
            default -> "I'm not sure I understand. Could you please rephrase that?";
        };
    }

    private List<String> generateSuggestions(String intent) {
        return switch (intent) {
            case "greeting" -> List.of("What can you do?", "Help me with something", "Tell me about yourself");
            case "help" -> List.of("How to use this", "What features are available", "Contact support");
            default -> List.of("Try asking for help", "Say hello", "Ask a question");
        };
    }

    // Inner classes for NLU communication
    private static class NluRequest {
        public String message;
        
        public NluRequest(String message) {
            this.message = message;
        }
    }

    private static class NluResponse {
        public String intent;
        public Double confidence;
        public Map<String, Object> entities;

        public NluResponse(String intent, Double confidence, Map<String, Object> entities) {
            this.intent = intent;
            this.confidence = confidence;
            this.entities = entities;
        }
    }
}
