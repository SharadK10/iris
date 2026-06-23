package com.iris.websocket;

public record JoinPayload(
        String listenerId,
        String nickname,
        String conductorToken
) {
}
