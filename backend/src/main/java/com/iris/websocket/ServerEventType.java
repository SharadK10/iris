package com.iris.websocket;

public enum ServerEventType {
    ECHO_STATE,
    LISTENER_JOINED,
    LISTENER_LEFT,
    BLOOM_STARTED,
    BLOOM_PAUSED,
    BLOOM_CHANGED,
    GARDEN_UPDATED,
    CONDUCTOR_CHANGED,
    REACTION
}
