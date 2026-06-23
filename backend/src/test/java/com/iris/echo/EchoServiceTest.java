package com.iris.echo;

import com.iris.bloom.Bloom;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EchoServiceTest {

    static class TestClock extends Clock {
        private Instant instant;

        TestClock(Instant instant) {
            this.instant = instant;
        }

        void advance(Duration duration) {
            instant = instant.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return instant;
        }
    }

    @Mock
    private EchoRepository repository;

    private TestClock clock;
    private EchoService service;

    @BeforeEach
    void setUp() {
        clock = new TestClock(Instant.parse("2026-06-23T00:00:00Z"));
        service = new EchoService(repository, clock);
    }

    private Echo stored(String conductorId) {
        Echo echo = new Echo("id-1", "A4J2KQ", conductorId);
        when(repository.find("A4J2KQ")).thenReturn(Optional.of(echo));
        return echo;
    }

    @Test
    void joinAddsListener() {
        stored("token-1");

        Echo result = service.join("a4j2kq", "listener-1", "Sharad", null);

        assertThat(result.getListeners()).hasSize(1);
        assertThat(result.getListeners().get(0).nickname()).isEqualTo("Sharad");
    }

    @Test
    void joinWithMatchingTokenClaimsConductor() {
        stored("token-1");

        Echo result = service.join("A4J2KQ", "listener-1", "Sharad", "token-1");

        assertThat(result.getConductorId()).isEqualTo("listener-1");
    }

    @Test
    void joinWithoutTokenLeavesConductorUnchanged() {
        stored("token-1");

        Echo result = service.join("A4J2KQ", "listener-2", "Rahul", null);

        assertThat(result.getConductorId()).isEqualTo("token-1");
    }

    @Test
    void rejoinUpdatesNicknameWithoutDuplicating() {
        stored("token-1");

        service.join("A4J2KQ", "listener-1", "Sharad", null);
        Echo result = service.join("A4J2KQ", "listener-1", "Sharad B", null);

        assertThat(result.getListeners()).hasSize(1);
        assertThat(result.getListeners().get(0).nickname()).isEqualTo("Sharad B");
    }

    @Test
    void leaveRemovesListener() {
        stored("token-1");
        service.join("A4J2KQ", "listener-1", "Sharad", null);

        Echo result = service.leave("A4J2KQ", "listener-1").orElseThrow().echo();

        assertThat(result.getListeners()).isEmpty();
    }

    @Test
    void leavingConductorPromotesEarliestRemainingListener() {
        stored("token-1");
        service.join("A4J2KQ", "listener-1", "Sharad", "token-1"); // claims the conductor token
        service.join("A4J2KQ", "listener-2", "Mira", null);
        service.join("A4J2KQ", "listener-3", "Theo", null);

        LeaveOutcome outcome = service.leave("A4J2KQ", "listener-1").orElseThrow();

        assertThat(outcome.conductorChanged()).isTrue();
        assertThat(outcome.echo().getConductorId()).isEqualTo("listener-2");
        assertThat(outcome.newConductorNickname()).isEqualTo("Mira");
        assertThat(outcome.leaverNickname()).isEqualTo("Sharad");
    }

    @Test
    void lastListenerStandingBecomesConductor() {
        stored("token-1");
        service.join("A4J2KQ", "listener-1", "Sharad", "token-1");
        service.join("A4J2KQ", "listener-2", "Mira", null);

        // Conductor leaves: Mira inherits and is now the sole listener.
        LeaveOutcome promoted = service.leave("A4J2KQ", "listener-1").orElseThrow();
        assertThat(promoted.echo().getConductorId()).isEqualTo("listener-2");

        // The last person standing leaves: no one to inherit the role.
        LeaveOutcome lastOut = service.leave("A4J2KQ", "listener-2").orElseThrow();
        assertThat(lastOut.echo().getListeners()).isEmpty();
        assertThat(lastOut.conductorChanged()).isFalse();
    }

    @Test
    void leavingNonConductorKeepsConductor() {
        stored("token-1");
        service.join("A4J2KQ", "listener-1", "Sharad", "token-1");
        service.join("A4J2KQ", "listener-2", "Mira", null);

        LeaveOutcome outcome = service.leave("A4J2KQ", "listener-2").orElseThrow();

        assertThat(outcome.conductorChanged()).isFalse();
        assertThat(outcome.echo().getConductorId()).isEqualTo("listener-1");
    }

    @Test
    void addToGardenStampsAddedByFromListener() {
        stored("token-1");
        service.join("A4J2KQ", "listener-1", "Sharad", null);

        Bloom bloom = new Bloom("vid1", "Lofi Beats", "ChillHop", "http://img/abc.jpg", 200);
        Echo result = service.addToGarden("A4J2KQ", bloom, "listener-1");

        assertThat(result.getGarden()).hasSize(1);
        assertThat(result.getGarden().get(0).addedBy()).isEqualTo("Sharad");
        assertThat(result.getGarden().get(0).id()).isNotBlank();
    }

    @Test
    void removeFromGardenRemovesById() {
        stored("token-1");
        service.join("A4J2KQ", "listener-1", "Sharad", null);
        Bloom bloom = new Bloom("vid1", "Lofi Beats", "ChillHop", "http://img/abc.jpg", 200);
        String itemId = service.addToGarden("A4J2KQ", bloom, "listener-1").getGarden().get(0).id();

        Echo result = service.removeFromGarden("A4J2KQ", itemId);

        assertThat(result.getGarden()).isEmpty();
    }

    @Test
    void nextBloomMovesGardenHeadIntoBloom() {
        stored("conductor-1");
        service.join("A4J2KQ", "listener-1", "Sharad", null);
        service.addToGarden("A4J2KQ", new Bloom("v1", "First", "A", "t", 100), "listener-1");
        service.addToGarden("A4J2KQ", new Bloom("v2", "Second", "B", "t", 120), "listener-1");

        Echo result = service.nextBloom("A4J2KQ", "conductor-1");

        assertThat(result.getCurrentBloom().title()).isEqualTo("First");
        assertThat(result.isPlaying()).isTrue();
        assertThat(result.getPosition()).isZero();
        assertThat(result.getGarden()).hasSize(1);
    }

    @Test
    void nextBloomOnEmptyGardenClearsBloom() {
        Echo echo = stored("conductor-1");
        echo.setCurrentBloom(new Bloom("v1", "First", "A", "t", 100));
        echo.setPlaying(true);

        Echo result = service.nextBloom("A4J2KQ", "conductor-1");

        assertThat(result.getCurrentBloom()).isNull();
        assertThat(result.isPlaying()).isFalse();
    }

    @Test
    void playPauseSeekRequireConductor() {
        stored("conductor-1");

        assertThat(service.play("A4J2KQ", "conductor-1").isPlaying()).isTrue();
        assertThat(service.seek("A4J2KQ", "conductor-1", 42.5).getPosition()).isEqualTo(42.5);
        assertThat(service.pause("A4J2KQ", "conductor-1").isPlaying()).isFalse();
    }

    @Test
    void nonConductorCannotControlPlayback() {
        stored("conductor-1");

        assertThatThrownBy(() -> service.play("A4J2KQ", "intruder"))
                .isInstanceOf(NotConductorException.class);
        assertThatThrownBy(() -> service.nextBloom("A4J2KQ", "intruder"))
                .isInstanceOf(NotConductorException.class);
    }

    @Test
    void pauseFreezesEffectivePosition() {
        stored("conductor-1");
        service.seek("A4J2KQ", "conductor-1", 10);
        service.play("A4J2KQ", "conductor-1");

        clock.advance(Duration.ofSeconds(5));
        Echo result = service.pause("A4J2KQ", "conductor-1");

        assertThat(result.getPosition()).isEqualTo(15.0);
        assertThat(result.isPlaying()).isFalse();
    }

    @Test
    void transferConductorToAnotherListener() {
        stored("conductor-1");
        service.join("A4J2KQ", "conductor-1", "Sharad", null);
        service.join("A4J2KQ", "rahul-1", "Rahul", null);

        Echo result = service.transferConductor("A4J2KQ", "conductor-1", "rahul-1");

        assertThat(result.getConductorId()).isEqualTo("rahul-1");
    }

    @Test
    void transferConductorIgnoresNonListenerTarget() {
        stored("conductor-1");
        service.join("A4J2KQ", "conductor-1", "Sharad", null);

        Echo result = service.transferConductor("A4J2KQ", "conductor-1", "ghost");

        assertThat(result.getConductorId()).isEqualTo("conductor-1");
    }

    @Test
    void nonConductorCannotTransfer() {
        stored("conductor-1");
        service.join("A4J2KQ", "conductor-1", "Sharad", null);
        service.join("A4J2KQ", "rahul-1", "Rahul", null);

        assertThatThrownBy(() -> service.transferConductor("A4J2KQ", "rahul-1", "rahul-1"))
                .isInstanceOf(NotConductorException.class);
    }

    @Test
    void joinOnMissingEchoThrows() {
        when(repository.find(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.join("ZZZZZZ", "listener-1", "Sharad", null))
                .isInstanceOf(EchoNotFoundException.class);
    }
}
