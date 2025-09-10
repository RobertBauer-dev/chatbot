package com.chatbot.session.repository;

import com.chatbot.session.model.Session;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends MongoRepository<Session, String> {
    
    Optional<Session> findBySessionIdAndUserId(String sessionId, String userId);
    
    List<Session> findByUserId(String userId);
    
    List<Session> findByStatusAndLastActivityBefore(Session.SessionStatus status, LocalDateTime cutoff);
    
    void deleteBySessionId(String sessionId);
}
