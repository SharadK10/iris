package com.iris.websocket;

import com.iris.echo.Echo;
import com.iris.echo.EchoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Optional;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "iris.frontend-origin=*"
)
class EchoSocketHandlerTest {

    @LocalServerPort
    private int port;

    @MockBean
    private EchoRepository repository;

    @Test
    void sendsEchoStateOnConnect() throws Exception {
        when(repository.find("TEST01")).thenReturn(Optional.of(new Echo("id-1", "TEST01", "token-1")));

        BlockingQueue<String> received = new LinkedBlockingQueue<>();
        WebSocketSession session = connect("TEST01", received);

        String snapshot = received.poll(3, TimeUnit.SECONDS);
        assertThat(snapshot).isNotNull();
        assertThat(snapshot).contains("ECHO_STATE");
        assertThat(snapshot).contains("TEST01");

        session.close();
    }

    @Test
    void joinAddsListenerAndClaimsConductor() throws Exception {
        Echo echo = new Echo("id-1", "TEST02", "token-1");
        when(repository.find("TEST02")).thenReturn(Optional.of(echo));

        BlockingQueue<String> received = new LinkedBlockingQueue<>();
        WebSocketSession session = connect("TEST02", received);

        received.poll(3, TimeUnit.SECONDS); // initial snapshot

        session.sendMessage(new TextMessage(
                "{\"type\":\"JOIN_ECHO\",\"payload\":" +
                        "{\"listenerId\":\"L1\",\"nickname\":\"Sharad\",\"conductorToken\":\"token-1\"}}"));

        String afterJoin = received.poll(3, TimeUnit.SECONDS);
        assertThat(afterJoin).isNotNull();
        assertThat(afterJoin).contains("ECHO_STATE");
        assertThat(afterJoin).contains("Sharad");
        assertThat(afterJoin).contains("\"conductorId\":\"L1\"");

        session.close();
    }

    @Test
    void addToGardenStampsAddedByAndBroadcasts() throws Exception {
        Echo echo = new Echo("id-1", "TEST04", "token-1");
        when(repository.find("TEST04")).thenReturn(Optional.of(echo));

        BlockingQueue<String> frames = new LinkedBlockingQueue<>();
        WebSocketSession session = connect("TEST04", frames);
        frames.poll(3, TimeUnit.SECONDS); // initial snapshot

        session.sendMessage(new TextMessage(
                "{\"type\":\"JOIN_ECHO\",\"payload\":{\"listenerId\":\"L1\",\"nickname\":\"Sharad\"}}"));
        frames.poll(3, TimeUnit.SECONDS); // after join

        session.sendMessage(new TextMessage(
                "{\"type\":\"ADD_TO_GARDEN\",\"payload\":" +
                        "{\"videoId\":\"vid1\",\"title\":\"Lofi Beats\",\"artist\":\"ChillHop\"," +
                        "\"thumbnail\":\"http://img/abc.jpg\",\"duration\":200}}"));

        String afterAdd = pollContaining(frames, "Lofi Beats");
        assertThat(afterAdd).isNotNull();
        assertThat(afterAdd).contains("\"addedBy\":\"Sharad\"");
        assertThat(afterAdd).contains("vid1");

        session.close();
    }

    @Test
    void nextBloomPromotesGardenHead() throws Exception {
        Echo echo = new Echo("id-1", "TEST05", "token-1");
        when(repository.find("TEST05")).thenReturn(Optional.of(echo));

        BlockingQueue<String> frames = new LinkedBlockingQueue<>();
        WebSocketSession session = connect("TEST05", frames);
        frames.poll(3, TimeUnit.SECONDS); // initial snapshot

        session.sendMessage(new TextMessage(
                "{\"type\":\"JOIN_ECHO\",\"payload\":" +
                        "{\"listenerId\":\"L1\",\"nickname\":\"Sharad\",\"conductorToken\":\"token-1\"}}"));
        frames.poll(3, TimeUnit.SECONDS);

        session.sendMessage(new TextMessage(
                "{\"type\":\"ADD_TO_GARDEN\",\"payload\":" +
                        "{\"videoId\":\"vid1\",\"title\":\"Lofi Beats\",\"artist\":\"ChillHop\"," +
                        "\"thumbnail\":\"t\",\"duration\":200}}"));
        pollContaining(frames, "Lofi Beats");

        session.sendMessage(new TextMessage("{\"type\":\"NEXT_BLOOM\",\"payload\":null}"));

        String afterNext = pollContaining(frames, "currentBloom");
        assertThat(afterNext).isNotNull();
        assertThat(afterNext).contains("\"currentBloom\":{");
        assertThat(afterNext).contains("\"playing\":true");
        assertThat(afterNext).contains("\"garden\":[]");

        session.close();
    }

    @Test
    void nonConductorPlayIsIgnored() throws Exception {
        Echo echo = new Echo("id-1", "TEST06", "token-1");
        when(repository.find("TEST06")).thenReturn(Optional.of(echo));

        BlockingQueue<String> frames = new LinkedBlockingQueue<>();
        WebSocketSession session = connect("TEST06", frames);
        frames.poll(3, TimeUnit.SECONDS); // initial snapshot

        // Join WITHOUT the conductor token — this listener is not the conductor.
        session.sendMessage(new TextMessage(
                "{\"type\":\"JOIN_ECHO\",\"payload\":{\"listenerId\":\"guest\",\"nickname\":\"Rahul\"}}"));
        frames.poll(3, TimeUnit.SECONDS); // after join

        session.sendMessage(new TextMessage("{\"type\":\"PLAY\",\"payload\":null}"));

        // No broadcast should follow a rejected control event.
        String afterPlay = frames.poll(1, TimeUnit.SECONDS);
        assertThat(afterPlay).isNull();

        session.close();
    }

    @Test
    void leaveRemovesListenerOnClose() throws Exception {
        Echo echo = new Echo("id-1", "TEST03", "token-1");
        when(repository.find("TEST03")).thenReturn(Optional.of(echo));

        BlockingQueue<String> watcher = new LinkedBlockingQueue<>();
        WebSocketSession observer = connect("TEST03", watcher);
        watcher.poll(3, TimeUnit.SECONDS); // observer's initial snapshot

        BlockingQueue<String> joinerFrames = new LinkedBlockingQueue<>();
        WebSocketSession joiner = connect("TEST03", joinerFrames);
        joinerFrames.poll(3, TimeUnit.SECONDS); // joiner's initial snapshot

        joiner.sendMessage(new TextMessage(
                "{\"type\":\"JOIN_ECHO\",\"payload\":{\"listenerId\":\"L2\",\"nickname\":\"Rahul\"}}"));

        // observer sees the join, then the leave
        String joinSeen = pollContaining(watcher, "Rahul");
        assertThat(joinSeen).isNotNull();

        joiner.close();

        String leaveSeen = watcher.poll(3, TimeUnit.SECONDS);
        assertThat(leaveSeen).isNotNull();
        assertThat(leaveSeen).doesNotContain("Rahul");

        observer.close();
    }

    private WebSocketSession connect(String code, BlockingQueue<String> sink) throws Exception {
        return new StandardWebSocketClient()
                .execute(new TextWebSocketHandler() {
                    @Override
                    protected void handleTextMessage(WebSocketSession s, TextMessage message) {
                        sink.add(message.getPayload());
                    }
                }, "ws://localhost:" + port + "/ws/echo/" + code)
                .get(3, TimeUnit.SECONDS);
    }

    private String pollContaining(BlockingQueue<String> sink, String needle) throws InterruptedException {
        for (int i = 0; i < 5; i++) {
            String frame = sink.poll(3, TimeUnit.SECONDS);
            if (frame == null) return null;
            if (frame.contains(needle)) return frame;
        }
        return null;
    }
}
