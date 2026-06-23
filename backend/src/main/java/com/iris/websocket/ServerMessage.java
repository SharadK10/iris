package com.iris.websocket;

public record ServerMessage(
        ServerEventType type,
        Object payload,
        Long serverTime
) {
    public static ServerMessage of(ServerEventType type, Object payload) {
        return new ServerMessage(type, payload, null);
    }

    public ServerMessage withServerTime(long serverTime) {
        return new ServerMessage(type, payload, serverTime);
    }
}
