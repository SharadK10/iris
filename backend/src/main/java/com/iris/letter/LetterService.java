package com.iris.letter;

import com.iris.bloom.Bloom;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LetterService {

    private static final int MAX_BLOOMS = 30;
    private static final int MAX_NAME = 80;
    private static final int MAX_OPENING = 1000;
    private static final int MAX_NOTE = 280;

    private final LetterRepository repository;
    private final Clock clock;
    private final Map<String, Object> locks = new ConcurrentHashMap<>();

    public LetterService(LetterRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public Letter create(CreateLetterRequest request) {
        List<CreateLetterRequest.PickedBloom> picked =
                request == null ? null : request.bouquet();
        if (picked == null || picked.isEmpty()) {
            throw new InvalidLetterException("A letter needs at least one bloom.");
        }
        if (picked.size() > MAX_BLOOMS) {
            throw new InvalidLetterException("A letter can hold at most " + MAX_BLOOMS + " blooms.");
        }

        List<Stem> bouquet = new ArrayList<>(picked.size());
        for (CreateLetterRequest.PickedBloom pick : picked) {
            Bloom bloom = pick == null ? null : pick.bloom();
            if (bloom == null || isBlank(bloom.videoId())) {
                throw new InvalidLetterException("Every bloom must be a real song.");
            }
            String note = clamp(pick.note(), MAX_NOTE);
            bouquet.add(new Stem(UUID.randomUUID().toString(), bloom, note));
        }

        Letter letter = new Letter(UUID.randomUUID().toString());
        letter.setRecipient(clamp(request.recipient(), MAX_NAME));
        letter.setSender(clamp(request.sender(), MAX_NAME));
        letter.setOpening(clamp(request.opening(), MAX_OPENING));
        letter.setBouquet(bouquet);
        letter.setOpened(false);
        letter.setSealedAt(clock.millis());

        repository.save(letter);
        return letter;
    }

    public Letter get(String id) {
        return repository.find(normalize(id))
                .orElseThrow(() -> new LetterNotFoundException(id));
    }

    public Letter open(String id) {
        String normalized = normalize(id);
        synchronized (lockFor(normalized)) {
            Letter letter = repository.find(normalized)
                    .orElseThrow(() -> new LetterNotFoundException(id));
            if (!letter.isOpened()) {
                letter.setOpened(true);
                letter.setOpenedAt(clock.millis());
                repository.save(letter);
            }
            return letter;
        }
    }

    private Object lockFor(String id) {
        return locks.computeIfAbsent(id, k -> new Object());
    }

    /** Trims a free-text field, returning null when blank and truncating to max length. */
    private String clamp(String value, int max) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.length() > max ? trimmed.substring(0, max) : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalize(String id) {
        return id == null ? "" : id.trim();
    }
}
