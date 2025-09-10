package com.chatbot.gateway.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class AuthService {

    @Value("${jwt.secret:mySecretKey}")
    private String jwtSecret;

    @Value("${jwt.expiration:3600}")
    private long jwtExpiration;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // In-memory user storage for demo purposes
    private final Map<String, String> users = new HashMap<>();

    public AuthService() {
        // Initialize with demo user
        users.put("demo", passwordEncoder.encode("password123"));
    }

    public Mono<String> authenticate(String username, String password) {
        return Mono.fromCallable(() -> {
            String storedPassword = users.get(username);
            if (storedPassword != null && passwordEncoder.matches(password, storedPassword)) {
                return generateToken(username);
            }
            throw new RuntimeException("Invalid credentials");
        });
    }

    public Mono<Void> register(String username, String password) {
        return Mono.fromRunnable(() -> {
            if (users.containsKey(username)) {
                throw new RuntimeException("User already exists");
            }
            users.put(username, passwordEncoder.encode(password));
            log.info("User registered: {}", username);
        });
    }

    private String generateToken(String username) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
        Instant now = Instant.now();
        Instant expiry = now.plus(jwtExpiration, ChronoUnit.SECONDS);

        return Jwts.builder()
                .setSubject(username)
                .claim("role", "USER")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }
}
