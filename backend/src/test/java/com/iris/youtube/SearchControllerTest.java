package com.iris.youtube;

import com.iris.bloom.Bloom;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SearchController.class)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private YoutubeService youtube;

    @Test
    void returnsResults() throws Exception {
        when(youtube.search(eq("lofi"))).thenReturn(List.of(
                new Bloom("abc123", "Lofi Beats", "ChillHop", "http://img/abc.jpg", 200)));

        mockMvc.perform(get("/api/search").param("q", "lofi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].videoId").value("abc123"))
                .andExpect(jsonPath("$[0].title").value("Lofi Beats"))
                .andExpect(jsonPath("$[0].artist").value("ChillHop"))
                .andExpect(jsonPath("$[0].duration").value(200));
    }

    @Test
    void returns503WhenSearchUnavailable() throws Exception {
        when(youtube.search(eq("lofi"))).thenThrow(new SearchUnavailableException());

        mockMvc.perform(get("/api/search").param("q", "lofi"))
                .andExpect(status().isServiceUnavailable());
    }
}
