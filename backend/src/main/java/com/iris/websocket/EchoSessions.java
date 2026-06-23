package com.iris.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.Clock;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class EchoSessions {

    private final Map<String, Set<WebSocketSession>> byEcho = new ConcurrentHashMap<>();
    private final ObjectMapper mapper;
    private final Clock clock;

    public EchoSessions(ObjectMapper mapper, Clock clock) {
        this.mapper = mapper;
        this.clock = clock;
    }

    public void add(String code, WebSocketSession session) {
        byEcho.computeIfAbsent(code, c -> ConcurrentHashMap.newKeySet()).add(session);
    }

    public void remove(String code, WebSocketSession session) {
        Set<WebSocketSession> sessions = byEcho.get(code);
        if (sessions == null) {
            return;
        }
        sessions.remove(session);
        if (sessions.isEmpty()) {
            byEcho.remove(code);
        }
    }

    public int count(String code) {
        Set<WebSocketSession> sessions = byEcho.get(code);
        return sessions == null ? 0 : sessions.size();
    }

    public void broadcast(String code, ServerMessage message) {
        Set<WebSocketSession> sessions = byEcho.get(code);
        if (sessions == null) {
            return;
        }
        String text = serialize(message);
        for (WebSocketSession session : sessions) {
            send(session, text);
        }
    }

    public void send(WebSocketSession session, ServerMessage message) {
        send(session, serialize(message));
    }

    private void send(WebSocketSession session, String text) {
        if (!session.isOpen()) {
            return;
        }
        try {
            synchronized (session) {
                session.sendMessage(new TextMessage(text));
            }
        } catch (IOException ignored) {
            // A dropped connection will be cleaned up on close.
        }
    }

    private String serialize(ServerMessage message) {
        try {
            return mapper.writeValueAsString(message.withServerTime(clock.millis()));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize ServerMessage", e);
        }
    }
}
