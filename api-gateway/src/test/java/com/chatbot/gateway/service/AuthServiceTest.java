package com.chatbot.gateway.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService();
    }

    @Test
    void testAuthenticateSuccess() {
        // Given
        String username = "demo";
        String password = "password123";

        // When
        Mono<String> result = authService.authenticate(username, password);

        // Then
        StepVerifier.create(result)
                .expectNext(token -> token != null && !token.isEmpty())
                .verifyComplete();
    }

    @Test
    void testAuthenticateFailure() {
        // Given
        String username = "demo";
        String wrongPassword = "wrongpassword";

        // When
        Mono<String> result = authService.authenticate(username, wrongPassword);

        // Then
        StepVerifier.create(result)
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    void testRegisterSuccess() {
        // Given
        String username = "newuser";
        String password = "password123";

        // When
        Mono<Void> result = authService.register(username, password);

        // Then
        StepVerifier.create(result)
                .verifyComplete();

        // Verify user can now authenticate
        Mono<String> authResult = authService.authenticate(username, password);
        StepVerifier.create(authResult)
                .expectNext(token -> token != null)
                .verifyComplete();
    }

    @Test
    void testRegisterExistingUser() {
        // Given
        String username = "demo";
        String password = "password123";

        // When
        Mono<Void> result = authService.register(username, password);

        // Then
        StepVerifier.create(result)
                .expectError(RuntimeException.class)
                .verify();
    }
}
