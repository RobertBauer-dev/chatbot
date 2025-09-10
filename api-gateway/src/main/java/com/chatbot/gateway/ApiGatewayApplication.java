package com.chatbot.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("session-service", r -> r.path("/api/sessions/**")
                        .uri("http://session-service:8081"))
                .route("nlu-service", r -> r.path("/api/nlu/**")
                        .uri("http://nlu-service:8000"))
                .route("chat", r -> r.path("/api/chat/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://session-service:8081"))
                .build();
    }
}
