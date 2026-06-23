package com.iris.youtube;

import com.fasterxml.jackson.databind.JsonNode;
import com.iris.bloom.Bloom;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.HtmlUtils;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class YoutubeService {

    private static final int MAX_RESULTS = 12;
    private static final String MUSIC_CATEGORY_ID = "10";

    // Strips marketing noise from video titles, e.g. "(Official Video)", "[Lyric Video]", "(4K Remaster)".
    private static final Pattern NOISE = Pattern.compile(
            "\\s*[\\(\\[][^\\)\\]]*\\b(official|lyric|lyrics|audio|video|visualizer|explicit|remaster(ed)?|hd|4k|mv|m/v|hq|full)\\b[^\\)\\]]*[\\)\\]]",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern SPLIT = Pattern.compile("\\s+[-–—]\\s+");
    // Strips a trailing pipe-delimited marketing tail, e.g. "Song | Official Music Video".
    private static final Pattern NOISE_TAIL = Pattern.compile(
            "\\s*[|｜]\\s*[^|｜]*\\b(official|lyric|lyrics|audio|video|visualizer|explicit|remaster(ed)?|hd|4k|mv|m/v|hq|full|music)\\b[^|｜]*$",
            Pattern.CASE_INSENSITIVE);

    private final RestClient client;
    private final String apiKey;

    public YoutubeService(
            RestClient.Builder builder,
            @Value("${iris.youtube.api-key}") String apiKey,
            @Value("${iris.youtube.base-url:https://www.googleapis.com/youtube/v3}") String baseUrl) {
        this.client = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public List<Bloom> search(String query) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new SearchUnavailableException();
        }
        if (query == null || query.isBlank()) {
            return List.of();
        }

        JsonNode search = client.get()
                .uri(uri -> uri.path("/search")
                        .queryParam("part", "snippet")
                        .queryParam("type", "video")
                        .queryParam("videoCategoryId", MUSIC_CATEGORY_ID)
                        .queryParam("maxResults", MAX_RESULTS)
                        .queryParam("q", query)
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .body(JsonNode.class);

        List<String> ids = new ArrayList<>();
        List<JsonNode> snippets = new ArrayList<>();
        if (search != null) {
            for (JsonNode item : search.path("items")) {
                String videoId = item.path("id").path("videoId").asText("");
                if (videoId.isBlank()) {
                    continue;
                }
                ids.add(videoId);
                snippets.add(item.path("snippet"));
            }
        }

        if (ids.isEmpty()) {
            return List.of();
        }

        Map<String, Integer> durations = durations(ids);
        List<Bloom> results = new ArrayList<>(ids.size());
        for (int i = 0; i < ids.size(); i++) {
            String videoId = ids.get(i);
            JsonNode snippet = snippets.get(i);
            String channel = snippet.path("channelTitle").asText("");
            String rawTitle = snippet.path("title").asText("");

            String[] parsed = extractArtistAndTitle(channel, rawTitle);
            results.add(new Bloom(
                    videoId,
                    parsed[1],
                    parsed[0],
                    artwork(snippet.path("thumbnails")),
                    durations.getOrDefault(videoId, 0)));
        }

        results.sort(Comparator.comparingInt(this::rank).reversed());
        return results;
    }

    private Map<String, Integer> durations(List<String> ids) {
        JsonNode videos = client.get()
                .uri(uri -> uri.path("/videos")
                        .queryParam("part", "contentDetails")
                        .queryParam("id", String.join(",", ids))
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .body(JsonNode.class);

        Map<String, Integer> result = new HashMap<>();
        if (videos != null) {
            for (JsonNode item : videos.path("items")) {
                result.put(item.path("id").asText(""),
                        parseSeconds(item.path("contentDetails").path("duration").asText("")));
            }
        }
        return result;
    }

    // Returns [artist, title], pulling clean music metadata out of YouTube's video-shaped fields.
    String[] extractArtistAndTitle(String channel, String rawTitle) {
        String decodedChannel = HtmlUtils.htmlUnescape(channel == null ? "" : channel);
        String title = cleanTitle(rawTitle);

        if (decodedChannel.endsWith("- Topic")) {
            String artist = decodedChannel.substring(0, decodedChannel.length() - "- Topic".length()).trim();
            return new String[] {artist, title};
        }

        String[] parts = SPLIT.split(title, 2);
        if (parts.length == 2 && !parts[0].isBlank() && !parts[1].isBlank()) {
            return new String[] {parts[0].trim(), parts[1].trim()};
        }

        return new String[] {decodedChannel.trim(), title};
    }

    private String cleanTitle(String title) {
        // The YouTube API returns HTML-escaped titles (&amp;, &#39;, &#243;…); decode first.
        String decoded = HtmlUtils.htmlUnescape(title == null ? "" : title);
        String cleaned = NOISE.matcher(decoded).replaceAll("");
        cleaned = NOISE_TAIL.matcher(cleaned).replaceAll("");
        cleaned = cleaned.replaceAll("\\s{2,}", " ").trim();
        cleaned = cleaned.replaceAll("[\\s\\-–—|｜]+$", "").trim();
        return cleaned.isBlank() ? decoded.trim() : cleaned;
    }

    private int rank(Bloom bloom) {
        String artist = bloom.artist().toLowerCase();
        if (artist.contains("vevo")) {
            return 3;
        }
        if (artist.contains("official")) {
            return 2;
        }
        return bloom.duration() > 0 && bloom.duration() < 900 ? 1 : 0;
    }

    private String artwork(JsonNode thumbnails) {
        // Prefer the clean 16:9 sizes (maxres, medium). The 4:3 sizes (high,
        // default) bake black letterbox bars into the image, which show as strips
        // when the artwork is cropped to a square. They stay only as a last resort.
        for (String size : new String[] {"maxres", "medium", "high", "default"}) {
            if (thumbnails.has(size)) {
                return thumbnails.path(size).path("url").asText("");
            }
        }
        return "";
    }

    private int parseSeconds(String iso) {
        if (iso == null || iso.isBlank()) {
            return 0;
        }
        try {
            return (int) Duration.parse(iso).toSeconds();
        } catch (Exception e) {
            return 0;
        }
    }
}
