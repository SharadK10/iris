package com.iris.echo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Optional;

@Repository
public class EchoRepository {

    private static final String KEY_PREFIX = "echo:";
    private static final Duration TTL = Duration.ofHours(12);

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;

    public EchoRepository(StringRedisTemplate redis, ObjectMapper mapper) {
        this.redis = redis;
        this.mapper = mapper;
    }

    public boolean exists(String code) {
        return Boolean.TRUE.equals(redis.hasKey(key(code)));
    }

    public void save(Echo echo) {
        try {
            String json = mapper.writeValueAsString(echo);
            redis.opsForValue().set(key(echo.getCode()), json, TTL);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize Echo", e);
        }
    }

    public Optional<Echo> find(String code) {
        String json = redis.opsForValue().get(key(code));
        if (json == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(mapper.readValue(json, Echo.class));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize Echo", e);
        }
    }

    private String key(String code) {
        return KEY_PREFIX + code;
    }
}
