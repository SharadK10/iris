package com.iris.letter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iris.press.PressedLetter;
import com.iris.press.PressedLetterRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

/**
 * Two-tier storage for letters. Ordinary letters live in Redis under a 12-hour
 * TTL (refreshed on read). "Pressed" letters — paid for, permanent — also live in
 * Postgres, which is their source of truth; Redis keeps a non-expiring mirror for
 * fast reads.
 */
@Repository
public class LetterRepository {

    private static final String KEY_PREFIX = "letter:";
    private static final Duration TTL = Duration.ofHours(12);

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;
    private final PressedLetterRepository pressed;
    private final Clock clock;

    public LetterRepository(StringRedisTemplate redis, ObjectMapper mapper,
                            PressedLetterRepository pressed, Clock clock) {
        this.redis = redis;
        this.mapper = mapper;
        this.pressed = pressed;
        this.clock = clock;
    }

    public void save(Letter letter) {
        String json = serialize(letter);
        if (letter.isPermanent()) {
            // Durable store is the source of truth; keep a non-expiring warm copy in Redis.
            // set(...) without a TTL clears any prior expiry on the key.
            redis.opsForValue().set(key(letter.getId()), json);
            upsertDurable(letter.getId(), json);
        } else {
            redis.opsForValue().set(key(letter.getId()), json, TTL);
        }
    }

    /**
     * Reads a Letter. For ordinary letters this refreshes the TTL, so one still
     * being opened and read won't expire mid-listen. Pressed letters never expire
     * and fall back to the durable store if the Redis mirror is gone.
     */
    public Optional<Letter> find(String id) {
        String json = redis.opsForValue().get(key(id));
        if (json != null) {
            Letter letter = deserialize(json);
            if (!letter.isPermanent()) {
                redis.expire(key(id), TTL);
            }
            return Optional.of(letter);
        }
        // Redis miss: a pressed letter may still be in the durable store. Warm Redis on read.
        return pressed.findById(id).map(row -> {
            Letter letter = deserialize(row.getPayload());
            redis.opsForValue().set(key(id), row.getPayload());
            return letter;
        });
    }

    private void upsertDurable(String id, String json) {
        PressedLetter row = pressed.findById(id).orElse(null);
        if (row == null) {
            Instant now = clock.instant();
            pressed.save(new PressedLetter(id, json, now, now));
        } else {
            row.setPayload(json);
            row.setPermanent(true);
            pressed.save(row);
        }
    }

    private String serialize(Letter letter) {
        try {
            return mapper.writeValueAsString(letter);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize Letter", e);
        }
    }

    private Letter deserialize(String json) {
        try {
            return mapper.readValue(json, Letter.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize Letter", e);
        }
    }

    private String key(String id) {
        return KEY_PREFIX + id;
    }
}
