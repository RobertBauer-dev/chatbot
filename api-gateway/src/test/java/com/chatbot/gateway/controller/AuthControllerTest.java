package com.chatbot.gateway.controller;

import com.chatbot.gateway.dto.LoginRequest;
import com.chatbot.gateway.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void testLoginSuccess() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("demo");
        request.setPassword("password123");
        
        String token = "jwt-token-123";
        when(authService.authenticate("demo", "password123"))
                .thenReturn(Mono.just(token));

        // When
        Mono<ResponseEntity<Object>> result = authController.login(request);

        // Then
        StepVerifier.create(result)
                .expectNext(response -> response.getStatusCode() == HttpStatus.OK)
                .verifyComplete();
    }

    @Test
    void testLoginFailure() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("demo");
        request.setPassword("wrongpassword");
        
        when(authService.authenticate(anyString(), anyString()))
                .thenReturn(Mono.error(new RuntimeException("Invalid credentials")));

        // When
        Mono<ResponseEntity<Object>> result = authController.login(request);

        // Then
        StepVerifier.create(result)
                .expectNext(response -> response.getStatusCode() == HttpStatus.UNAUTHORIZED)
                .verifyComplete();
    }

    @Test
    void testRegisterSuccess() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("newuser");
        request.setPassword("password123");
        
        when(authService.register("newuser", "password123"))
                .thenReturn(Mono.empty());

        // When
        Mono<ResponseEntity<String>> result = authController.register(request);

        // Then
        StepVerifier.create(result)
                .expectNext(response -> 
                    response.getStatusCode() == HttpStatus.OK && 
                    response.getBody().equals("User registered successfully")
                )
                .verifyComplete();
    }
}
