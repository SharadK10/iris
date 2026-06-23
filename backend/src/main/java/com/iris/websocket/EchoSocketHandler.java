package com.iris.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iris.bloom.Bloom;
import com.iris.echo.Echo;
import com.iris.echo.EchoNotFoundException;
import com.iris.echo.EchoService;
import com.iris.echo.NotConductorException;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;

public class EchoSocketHandler extends TextWebSocketHandler {

    private static final String CODE_ATTRIBUTE = "echoCode";
    private static final String LISTENER_ATTRIBUTE = "listenerId";

    private final EchoService echoService;
    private final EchoSessions sessions;
    private final ObjectMapper mapper;

    public EchoSocketHandler(EchoService echoService, EchoSessions sessions, ObjectMapper mapper) {
        this.echoService = echoService;
        this.sessions = sessions;
        this.mapper = mapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String code = codeFrom(session);
        session.getAttributes().put(CODE_ATTRIBUTE, code);
        sessions.add(code, session);

        try {
            sessions.send(session, ServerMessage.of(ServerEventType.ECHO_STATE, echoService.get(code)));
        } catch (EchoNotFoundException ignored) {
            // No snapshot yet; the channel stays open for upcoming events.
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ClientMessage incoming = mapper.readValue(message.getPayload(), ClientMessage.class);
        String code = (String) session.getAttributes().get(CODE_ATTRIBUTE);
        switch (incoming.type()) {
            case JOIN_ECHO -> handleJoin(session, code, incoming.payload());
            case LEAVE_ECHO -> handleLeave(session, code);
            case ADD_TO_GARDEN -> handleAddToGarden(session, code, incoming.payload());
            case REMOVE_FROM_GARDEN -> handleRemoveFromGarden(code, incoming.payload());
            case PLAY -> mutateAndBroadcast(code, () -> echoService.play(code, requesterId(session)));
            case PAUSE -> mutateAndBroadcast(code, () -> echoService.pause(code, requesterId(session)));
            case SEEK -> {
                double position = incoming.payload() == null
                        ? 0 : incoming.payload().path("position").asDouble(0);
                mutateAndBroadcast(code, () -> echoService.seek(code, requesterId(session), position));
            }
            case NEXT_BLOOM -> mutateAndBroadcast(code, () -> echoService.nextBloom(code, requesterId(session)));
            case TRANSFER_CONDUCTOR -> handleTransferConductor(session, code, incoming.payload());
            case HEARTBEAT -> {
                // Keep-alive only.
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Object code = session.getAttributes().get(CODE_ATTRIBUTE);
        if (code == null) {
            return;
        }
        sessions.remove(code.toString(), session);
        removeListener(session, code.toString());
    }

    private void handleJoin(WebSocketSession session, String code, com.fasterxml.jackson.databind.JsonNode payload) {
        JoinPayload join = mapper.convertValue(payload, JoinPayload.class);
        if (join == null || join.listenerId() == null || join.listenerId().isBlank()) {
            return;
        }
        session.getAttributes().put(LISTENER_ATTRIBUTE, join.listenerId());
        try {
            Echo echo = echoService.join(code, join.listenerId(), nicknameOf(join), join.conductorToken());
            sessions.broadcast(code, ServerMessage.of(ServerEventType.ECHO_STATE, echo));
        } catch (EchoNotFoundException ignored) {
            // The echo expired between connect and join; nothing to broadcast.
        }
    }

    private void handleLeave(WebSocketSession session, String code) {
        removeListener(session, code);
    }

    private void handleAddToGarden(WebSocketSession session, String code, JsonNode payload) {
        Object listenerId = session.getAttributes().get(LISTENER_ATTRIBUTE);
        if (listenerId == null || payload == null) {
            return;
        }
        Bloom bloom = mapper.convertValue(payload, Bloom.class);
        if (bloom == null || bloom.videoId() == null || bloom.videoId().isBlank()) {
            return;
        }
        try {
            Echo echo = echoService.addToGarden(code, bloom, listenerId.toString());
            sessions.broadcast(code, ServerMessage.of(ServerEventType.ECHO_STATE, echo));
        } catch (EchoNotFoundException ignored) {
            // The echo expired; nothing to broadcast.
        }
    }

    private void handleTransferConductor(WebSocketSession session, String code, JsonNode payload) {
        String requesterId = requesterId(session);
        String newConductorId = payload == null ? "" : payload.path("newConductorId").asText("");
        if (requesterId == null || newConductorId.isBlank()) {
            return;
        }
        try {
            Echo echo = echoService.transferConductor(code, requesterId, newConductorId);
            sessions.broadcast(code, ServerMessage.of(ServerEventType.ECHO_STATE, echo));
            if (newConductorId.equals(echo.getConductorId())) {
                sessions.broadcast(code, ServerMessage.of(ServerEventType.CONDUCTOR_CHANGED, java.util.Map.of(
                        "from", echoService.nicknameFor(echo, requesterId),
                        "to", echoService.nicknameFor(echo, newConductorId))));
            }
        } catch (EchoNotFoundException | NotConductorException ignored) {
            // Expired echo or a non-conductor request; nothing to broadcast.
        }
    }

    private String requesterId(WebSocketSession session) {
        Object listenerId = session.getAttributes().get(LISTENER_ATTRIBUTE);
        return listenerId == null ? null : listenerId.toString();
    }

    private void mutateAndBroadcast(String code, java.util.function.Supplier<Echo> operation) {
        try {
            sessions.broadcast(code, ServerMessage.of(ServerEventType.ECHO_STATE, operation.get()));
        } catch (EchoNotFoundException ignored) {
            // The echo expired; nothing to broadcast.
        } catch (NotConductorException ignored) {
            // Non-conductors cannot drive playback; silently ignore.
        }
    }

    private void handleRemoveFromGarden(String code, JsonNode payload) {
        if (payload == null) {
            return;
        }
        String itemId = payload.path("itemId").asText("");
        if (itemId.isBlank()) {
            return;
        }
        try {
            Echo echo = echoService.removeFromGarden(code, itemId);
            sessions.broadcast(code, ServerMessage.of(ServerEventType.ECHO_STATE, echo));
        } catch (EchoNotFoundException ignored) {
            // The echo expired; nothing to broadcast.
        }
    }

    private void removeListener(WebSocketSession session, String code) {
        Object listenerId = session.getAttributes().get(LISTENER_ATTRIBUTE);
        if (listenerId == null) {
            return;
        }
        echoService.leave(code, listenerId.toString())
                .ifPresent(echo -> sessions.broadcast(code, ServerMessage.of(ServerEventType.ECHO_STATE, echo)));
    }

    private String nicknameOf(JoinPayload join) {
        String nickname = join.nickname();
        return nickname == null || nickname.isBlank() ? "Listener" : nickname.trim();
    }

    private String codeFrom(WebSocketSession session) {
        URI uri = session.getUri();
        String path = uri == null ? "" : uri.getPath();
        String last = path.substring(path.lastIndexOf('/') + 1);
        return last.trim().toUpperCase();
    }
}
