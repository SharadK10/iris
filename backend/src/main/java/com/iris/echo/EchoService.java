package com.iris.echo;

import com.iris.bloom.Bloom;
import com.iris.garden.GardenItem;
import com.iris.listener.Listener;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EchoService {

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;

    private final EchoRepository repository;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, Object> locks = new ConcurrentHashMap<>();

    public EchoService(EchoRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public Echo create() {
        String code = uniqueCode();
        String id = UUID.randomUUID().toString();
        String conductorId = UUID.randomUUID().toString();

        Echo echo = new Echo(id, code, conductorId);
        echo.setUpdatedAt(clock.millis());
        repository.save(echo);
        return echo;
    }

    public Echo get(String code) {
        return repository.find(normalize(code))
                .orElseThrow(() -> new EchoNotFoundException(code));
    }

    public Echo join(String code, String listenerId, String nickname, String conductorToken) {
        String normalized = normalize(code);
        synchronized (lockFor(normalized)) {
            Echo echo = repository.find(normalized)
                    .orElseThrow(() -> new EchoNotFoundException(code));
            upsertListener(echo, listenerId, nickname);
            if (conductorToken != null && conductorToken.equals(echo.getConductorId())) {
                echo.setConductorId(listenerId);
            }
            repository.save(echo);
            return echo;
        }
    }

    public Optional<LeaveOutcome> leave(String code, String listenerId) {
        String normalized = normalize(code);
        synchronized (lockFor(normalized)) {
            Optional<Echo> found = repository.find(normalized);
            if (found.isEmpty()) {
                return Optional.empty();
            }
            Echo echo = found.get();
            String leaverNickname = nicknameOf(echo, listenerId);
            boolean wasConductor = listenerId.equals(echo.getConductorId());
            echo.getListeners().removeIf(listener -> listener.id().equals(listenerId));

            boolean conductorChanged = false;
            if (wasConductor && !echo.getListeners().isEmpty()) {
                Listener heir = echo.getListeners().stream()
                        .min(Comparator.comparing(Listener::joinedAt))
                        .orElseThrow();
                echo.setConductorId(heir.id());
                conductorChanged = true;
            }

            repository.save(echo);
            return Optional.of(new LeaveOutcome(
                    echo,
                    conductorChanged,
                    leaverNickname,
                    conductorChanged ? nicknameOf(echo, echo.getConductorId()) : null));
        }
    }

    public Echo addToGarden(String code, Bloom bloom, String listenerId) {
        String normalized = normalize(code);
        synchronized (lockFor(normalized)) {
            Echo echo = repository.find(normalized)
                    .orElseThrow(() -> new EchoNotFoundException(code));
            String addedBy = nicknameOf(echo, listenerId);
            echo.getGarden().add(new GardenItem(UUID.randomUUID().toString(), bloom, addedBy));
            repository.save(echo);
            return echo;
        }
    }

    public Echo removeFromGarden(String code, String itemId) {
        String normalized = normalize(code);
        synchronized (lockFor(normalized)) {
            Echo echo = repository.find(normalized)
                    .orElseThrow(() -> new EchoNotFoundException(code));
            echo.getGarden().removeIf(item -> item.id().equals(itemId));
            repository.save(echo);
            return echo;
        }
    }

    public Echo play(String code, String requesterId) {
        return mutateAsConductor(code, requesterId, echo -> {
            if (!echo.isPlaying()) {
                echo.setPlaying(true);
                echo.setUpdatedAt(clock.millis());
            }
        });
    }

    public Echo pause(String code, String requesterId) {
        return mutateAsConductor(code, requesterId, echo -> {
            if (echo.isPlaying()) {
                echo.setPosition(effectivePosition(echo));
                echo.setPlaying(false);
                echo.setUpdatedAt(clock.millis());
            }
        });
    }

    public Echo seek(String code, String requesterId, double position) {
        return mutateAsConductor(code, requesterId, echo -> {
            echo.setPosition(Math.max(0, position));
            echo.setUpdatedAt(clock.millis());
        });
    }

    public Echo nextBloom(String code, String requesterId) {
        return mutateAsConductor(code, requesterId, this::advance);
    }

    public Echo transferConductor(String code, String requesterId, String newConductorId) {
        return mutateAsConductor(code, requesterId, echo -> {
            boolean targetIsListener = echo.getListeners().stream()
                    .anyMatch(listener -> listener.id().equals(newConductorId));
            if (targetIsListener) {
                echo.setConductorId(newConductorId);
            }
        });
    }

    public String nicknameFor(Echo echo, String listenerId) {
        return nicknameOf(echo, listenerId);
    }

    private double effectivePosition(Echo echo) {
        if (!echo.isPlaying()) {
            return echo.getPosition();
        }
        double elapsed = (clock.millis() - echo.getUpdatedAt()) / 1000.0;
        return echo.getPosition() + Math.max(0, elapsed);
    }

    private void advance(Echo echo) {
        List<GardenItem> garden = echo.getGarden();
        echo.setPosition(0);
        echo.setUpdatedAt(clock.millis());
        if (garden.isEmpty()) {
            echo.setCurrentBloom(null);
            echo.setPlaying(false);
            return;
        }
        GardenItem next = garden.remove(0);
        echo.setCurrentBloom(next.bloom());
        echo.setPlaying(true);
    }

    private Echo mutateAsConductor(String code, String requesterId, java.util.function.Consumer<Echo> change) {
        String normalized = normalize(code);
        synchronized (lockFor(normalized)) {
            Echo echo = repository.find(normalized)
                    .orElseThrow(() -> new EchoNotFoundException(code));
            if (requesterId == null || !requesterId.equals(echo.getConductorId())) {
                throw new NotConductorException();
            }
            change.accept(echo);
            repository.save(echo);
            return echo;
        }
    }

    private String nicknameOf(Echo echo, String listenerId) {
        return echo.getListeners().stream()
                .filter(listener -> listener.id().equals(listenerId))
                .map(Listener::nickname)
                .findFirst()
                .orElse("Listener");
    }

    private void upsertListener(Echo echo, String listenerId, String nickname) {
        List<Listener> listeners = echo.getListeners();
        for (int i = 0; i < listeners.size(); i++) {
            if (listeners.get(i).id().equals(listenerId)) {
                listeners.set(i, new Listener(listenerId, nickname, listeners.get(i).joinedAt()));
                return;
            }
        }
        listeners.add(new Listener(listenerId, nickname, Instant.now()));
    }

    private Object lockFor(String code) {
        return locks.computeIfAbsent(code, c -> new Object());
    }

    private String uniqueCode() {
        String code;
        do {
            code = randomCode();
        } while (repository.exists(code));
        return code;
    }

    private String randomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
        }
        return sb.toString();
    }

    private String normalize(String code) {
        return code == null ? "" : code.trim().toUpperCase();
    }
}
