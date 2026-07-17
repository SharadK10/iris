package com.iris.letter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Optional;

@Repository
public class LetterRepository {

    private static final String KEY_PREFIX = "letter:";
    private static final Duration TTL = Duration.ofHours(12);

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;

    public LetterRepository(StringRedisTemplate redis, ObjectMapper mapper) {
        this.redis = redis;
        this.mapper = mapper;
    }

    public void save(Letter letter) {
        try {
            String json = mapper.writeValueAsString(letter);
            redis.opsForValue().set(key(letter.getId()), json, TTL);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize Letter", e);
        }
    }

    /**
     * Reads a Letter and refreshes its TTL, so a letter that is still being
     * opened and read won't expire mid-listen.
     */
    public Optional<Letter> find(String id) {
        String json = redis.opsForValue().get(key(id));
        if (json == null) {
            return Optional.empty();
        }
        redis.expire(key(id), TTL);
        try {
            return Optional.of(mapper.readValue(json, Letter.class));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize Letter", e);
        }
    }

    private String key(String id) {
        return KEY_PREFIX + id;
    }
}
