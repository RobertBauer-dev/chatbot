package com.chatbot.session.controller;

import com.chatbot.session.model.Session;
import com.chatbot.session.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public Mono<ResponseEntity<Session>> createSession(@RequestHeader("X-User-Id") String userId) {
        log.info("Creating new session for user: {}", userId);
        Session session = sessionService.createSession(userId);
        return Mono.just(ResponseEntity.ok(session));
    }

    @GetMapping("/{sessionId}")
    public Mono<ResponseEntity<Session>> getSession(
            @PathVariable String sessionId,
            @RequestHeader("X-User-Id") String userId) {
        
        return sessionService.getSession(sessionId, userId)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }

    @GetMapping
    public Mono<ResponseEntity<List<Session>>> getUserSessions(@RequestHeader("X-User-Id") String userId) {
        List<Session> sessions = sessionService.getUserSessions(userId);
        return Mono.just(ResponseEntity.ok(sessions));
    }

    @DeleteMapping("/{sessionId}")
    public Mono<ResponseEntity<Void>> terminateSession(
            @PathVariable String sessionId,
            @RequestHeader("X-User-Id") String userId) {
        
        sessionService.terminateSession(sessionId, userId);
        return Mono.just(ResponseEntity.ok().build());
    }
}
