package com.chatbot.session.service;

import com.chatbot.session.model.ConversationMessage;
import com.chatbot.session.model.Session;
import com.chatbot.session.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    private SessionService sessionService;

    @BeforeEach
    void setUp() {
        sessionService = new SessionService(sessionRepository);
    }

    @Test
    void testCreateSession() {
        // Given
        String userId = "user123";
        Session savedSession = new Session("session123", userId);
        
        when(sessionRepository.save(any(Session.class))).thenReturn(savedSession);

        // When
        Session result = sessionService.createSession(userId);

        // Then
        assertNotNull(result);
        assertEquals("session123", result.getSessionId());
        assertEquals(userId, result.getUserId());
        assertEquals(Session.SessionStatus.ACTIVE, result.getStatus());
        
        verify(sessionRepository).save(any(Session.class));
    }

    @Test
    void testGetSession() {
        // Given
        String sessionId = "session123";
        String userId = "user123";
        Session session = new Session(sessionId, userId);
        
        when(sessionRepository.findBySessionIdAndUserId(sessionId, userId))
                .thenReturn(Optional.of(session));

        // When
        Optional<Session> result = sessionService.getSession(sessionId, userId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(sessionId, result.get().getSessionId());
        assertEquals(userId, result.get().getUserId());
    }

    @Test
    void testGetOrCreateSession_ExistingSession() {
        // Given
        String sessionId = "session123";
        String userId = "user123";
        Session session = new Session(sessionId, userId);
        
        when(sessionRepository.findBySessionIdAndUserId(sessionId, userId))
                .thenReturn(Optional.of(session));

        // When
        Session result = sessionService.getOrCreateSession(sessionId, userId);

        // Then
        assertEquals(sessionId, result.getSessionId());
        assertEquals(userId, result.getUserId());
        verify(sessionRepository, never()).save(any(Session.class));
    }

    @Test
    void testGetOrCreateSession_NewSession() {
        // Given
        String sessionId = "session123";
        String userId = "user123";
        Session session = new Session(sessionId, userId);
        
        when(sessionRepository.findBySessionIdAndUserId(sessionId, userId))
                .thenReturn(Optional.empty());
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // When
        Session result = sessionService.getOrCreateSession(sessionId, userId);

        // Then
        assertNotNull(result);
        verify(sessionRepository).save(any(Session.class));
    }

    @Test
    void testAddMessageToSession() {
        // Given
        String sessionId = "session123";
        String userId = "user123";
        Session session = new Session(sessionId, userId);
        ConversationMessage message = new ConversationMessage("Hello", 
                ConversationMessage.MessageType.USER, userId);
        
        when(sessionRepository.findBySessionIdAndUserId(sessionId, userId))
                .thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // When
        Session result = sessionService.addMessageToSession(sessionId, userId, message);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getMessages().size());
        assertEquals("Hello", result.getMessages().get(0).getContent());
        verify(sessionRepository).save(session);
    }

    @Test
    void testTerminateSession() {
        // Given
        String sessionId = "session123";
        String userId = "user123";
        Session session = new Session(sessionId, userId);
        
        when(sessionRepository.findBySessionIdAndUserId(sessionId, userId))
                .thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // When
        sessionService.terminateSession(sessionId, userId);

        // Then
        assertEquals(Session.SessionStatus.TERMINATED, session.getStatus());
        verify(sessionRepository).save(session);
    }
}
