package com.iris.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iris.echo.EchoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final EchoService echoService;
    private final EchoSessions sessions;
    private final ObjectMapper mapper;
    private final String allowedOrigin;

    public WebSocketConfig(
            EchoService echoService,
            EchoSessions sessions,
            ObjectMapper mapper,
            @Value("${iris.frontend-origin}") String allowedOrigin) {
        this.echoService = echoService;
        this.sessions = sessions;
        this.mapper = mapper;
        this.allowedOrigin = allowedOrigin;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new EchoSocketHandler(echoService, sessions, mapper), "/ws/echo/*")
                .setAllowedOrigins(allowedOrigin);
    }
}
