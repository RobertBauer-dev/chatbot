package com.chatbot.session.service;

import com.chatbot.session.model.ConversationMessage;
import com.chatbot.session.model.Session;
import com.chatbot.session.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;

    public Session createSession(String userId) {
        String sessionId = UUID.randomUUID().toString();
        Session session = new Session(sessionId, userId);
        session = sessionRepository.save(session);
        log.info("Created new session: {} for user: {}", sessionId, userId);
        return session;
    }

    public Optional<Session> getSession(String sessionId, String userId) {
        return sessionRepository.findBySessionIdAndUserId(sessionId, userId);
    }

    public Session getOrCreateSession(String sessionId, String userId) {
        if (sessionId != null) {
            Optional<Session> existingSession = getSession(sessionId, userId);
            if (existingSession.isPresent()) {
                return existingSession.get();
            }
        }
        return createSession(userId);
    }

    public Session addMessageToSession(String sessionId, String userId, ConversationMessage message) {
        Session session = getOrCreateSession(sessionId, userId);
        session.addMessage(message);
        return sessionRepository.save(session);
    }

    public List<Session> getUserSessions(String userId) {
        return sessionRepository.findByUserId(userId);
    }

    public void terminateSession(String sessionId, String userId) {
        Optional<Session> session = getSession(sessionId, userId);
        if (session.isPresent()) {
            Session s = session.get();
            s.setStatus(Session.SessionStatus.TERMINATED);
            sessionRepository.save(s);
            log.info("Terminated session: {} for user: {}", sessionId, userId);
        }
    }

    public void cleanupExpiredSessions() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<Session> expiredSessions = sessionRepository.findByStatusAndLastActivityBefore(
                Session.SessionStatus.ACTIVE, cutoff);
        
        for (Session session : expiredSessions) {
            session.setStatus(Session.SessionStatus.EXPIRED);
        }
        
        if (!expiredSessions.isEmpty()) {
            sessionRepository.saveAll(expiredSessions);
            log.info("Marked {} sessions as expired", expiredSessions.size());
        }
    }
}
