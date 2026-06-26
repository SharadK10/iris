package com.iris.youtube;

import com.iris.bloom.Bloom;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class YoutubeServiceTest {

    private static final String SEARCH_JSON = """
            {
              "items": [
                {"id": {"videoId": "abc123"},
                 "snippet": {"title": "Lofi Beats", "channelTitle": "ChillHop",
                             "thumbnails": {"medium": {"url": "http://img/abc.jpg"}}}},
                {"id": {"videoId": "def456"},
                 "snippet": {"title": "Study Mix", "channelTitle": "Study",
                             "thumbnails": {"default": {"url": "http://img/def.jpg"}}}}
              ]
            }
            """;

    private static final String VIDEOS_JSON = """
            {
              "items": [
                {"id": "abc123", "contentDetails": {"duration": "PT3M20S"}},
                {"id": "def456", "contentDetails": {"duration": "PT1H2M5S"}}
              ]
            }
            """;

    @Test
    void mapsSearchAndDurations() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(containsString("/search")))
                .andRespond(withSuccess(SEARCH_JSON, MediaType.APPLICATION_JSON));
        server.expect(requestTo(containsString("/videos")))
                .andRespond(withSuccess(VIDEOS_JSON, MediaType.APPLICATION_JSON));

        YoutubeService service = new YoutubeService(builder, "test-key", "https://api.test/youtube/v3");
        List<Bloom> results = service.search("lofi");

        assertThat(results).hasSize(2);

        Bloom first = results.get(0);
        assertThat(first.videoId()).isEqualTo("abc123");
        assertThat(first.title()).isEqualTo("Lofi Beats");
        assertThat(first.artist()).isEqualTo("ChillHop");
        assertThat(first.thumbnail()).isEqualTo("http://img/abc.jpg");
        assertThat(first.duration()).isEqualTo(200);

        Bloom second = results.get(1);
        assertThat(second.thumbnail()).isEqualTo("http://img/def.jpg");
        assertThat(second.duration()).isEqualTo(3725);

        server.verify();
    }

    @Test
    void quotaExceededMapsToRateLimited() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(containsString("/search")))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS)
                        .body("{\"error\":{\"code\":429}}")
                        .contentType(MediaType.APPLICATION_JSON));

        YoutubeService service = new YoutubeService(builder, "test-key", "https://api.test/youtube/v3");

        assertThatThrownBy(() -> service.search("lofi"))
                .isInstanceOf(SearchRateLimitedException.class);
    }

    @Test
    void cachesRepeatedQueriesAcrossCase() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(containsString("/search")))
                .andRespond(withSuccess(SEARCH_JSON, MediaType.APPLICATION_JSON));
        server.expect(requestTo(containsString("/videos")))
                .andRespond(withSuccess(VIDEOS_JSON, MediaType.APPLICATION_JSON));

        YoutubeService service = new YoutubeService(builder, "test-key", "https://api.test/youtube/v3");
        service.search("lofi");
        List<Bloom> second = service.search("  LOFI ");

        assertThat(second).hasSize(2);
        server.verify(); // each endpoint hit exactly once; the repeat came from cache
    }

    @Test
    void throwsWhenApiKeyMissing() {
        YoutubeService service = new YoutubeService(RestClient.builder(), "", "https://api.test/youtube/v3");
        assertThatThrownBy(() -> service.search("lofi"))
                .isInstanceOf(SearchUnavailableException.class);
    }

    @Test
    void blankQueryReturnsEmpty() {
        YoutubeService service = new YoutubeService(RestClient.builder(), "test-key", "https://api.test/youtube/v3");
        assertThat(service.search("   ")).isEmpty();
    }

    @Test
    void extractsArtistFromTopicChannel() {
        YoutubeService service = new YoutubeService(RestClient.builder(), "k", "https://api.test/youtube/v3");
        String[] result = service.extractArtistAndTitle("Coldplay - Topic", "Yellow");
        assertThat(result[0]).isEqualTo("Coldplay");
        assertThat(result[1]).isEqualTo("Yellow");
    }

    @Test
    void extractsArtistFromDashTitleAndStripsNoise() {
        YoutubeService service = new YoutubeService(RestClient.builder(), "k", "https://api.test/youtube/v3");
        String[] result = service.extractArtistAndTitle("ColdplayVEVO", "Coldplay - Yellow (Official Video)");
        assertThat(result[0]).isEqualTo("Coldplay");
        assertThat(result[1]).isEqualTo("Yellow");
    }

    @Test
    void decodesHtmlEntitiesInTitle() {
        YoutubeService service = new YoutubeService(RestClient.builder(), "k", "https://api.test/youtube/v3");
        String[] result = service.extractArtistAndTitle("ArtistVEVO", "Tom &amp; Jerry - Don&#39;t Stop");
        assertThat(result[0]).isEqualTo("Tom & Jerry");
        assertThat(result[1]).isEqualTo("Don't Stop");
    }

    @Test
    void decodesHtmlEntitiesInTopicChannel() {
        YoutubeService service = new YoutubeService(RestClient.builder(), "k", "https://api.test/youtube/v3");
        String[] result = service.extractArtistAndTitle("Sigur R&#243;s - Topic", "Hopp&#243;polla");
        assertThat(result[0]).isEqualTo("Sigur Rós");
        assertThat(result[1]).isEqualTo("Hoppópolla");
    }

    @Test
    void stripsPipeDelimitedMarketingTail() {
        YoutubeService service = new YoutubeService(RestClient.builder(), "k", "https://api.test/youtube/v3");
        String[] result = service.extractArtistAndTitle("ArtistVEVO", "Adele - Hello | Official Music Video");
        assertThat(result[0]).isEqualTo("Adele");
        assertThat(result[1]).isEqualTo("Hello");
    }

    @Test
    void fallsBackToChannelWhenNoPattern() {
        YoutubeService service = new YoutubeService(RestClient.builder(), "k", "https://api.test/youtube/v3");
        String[] result = service.extractArtistAndTitle("Lofi Girl", "lofi hip hop radio");
        assertThat(result[0]).isEqualTo("Lofi Girl");
        assertThat(result[1]).isEqualTo("lofi hip hop radio");
    }
}
