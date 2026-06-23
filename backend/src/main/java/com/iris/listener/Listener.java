package com.iris.listener;

import java.time.Instant;

public record Listener(
        String id,
        String nickname,
        Instant joinedAt
) {
}
