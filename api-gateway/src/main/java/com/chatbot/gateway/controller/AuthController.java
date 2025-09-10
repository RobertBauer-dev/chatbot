package com.chatbot.gateway.controller;

import com.chatbot.gateway.dto.LoginRequest;
import com.chatbot.gateway.dto.LoginResponse;
import com.chatbot.gateway.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Mono<ResponseEntity<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsername());
        return authService.authenticate(request.getUsername(), request.getPassword())
                .map(token -> ResponseEntity.ok(new LoginResponse(token, "Bearer")))
                .onErrorReturn(ResponseEntity.status(401).build());
    }

    @PostMapping("/register")
    public Mono<ResponseEntity<String>> register(@Valid @RequestBody LoginRequest request) {
        log.info("Registration attempt for user: {}", request.getUsername());
        return authService.register(request.getUsername(), request.getPassword())
                .then(Mono.just(ResponseEntity.ok("User registered successfully")))
                .onErrorReturn(ResponseEntity.status(400).body("Registration failed"));
    }
}
