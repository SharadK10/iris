package com.iris.websocket;

import com.fasterxml.jackson.databind.JsonNode;

public record ClientMessage(
        ClientEventType type,
        JsonNode payload
) {
}
