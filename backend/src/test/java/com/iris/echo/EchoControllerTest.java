package com.iris.echo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EchoController.class)
class EchoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EchoService service;

    @Test
    void createReturnsNewEcho() throws Exception {
        when(service.create()).thenReturn(new Echo("id-1", "A4J2KQ", "conductor-1"));

        mockMvc.perform(post("/api/echoes"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("A4J2KQ"))
                .andExpect(jsonPath("$.conductorId").value("conductor-1"))
                .andExpect(jsonPath("$.playing").value(false));
    }

    @Test
    void getReturnsEcho() throws Exception {
        when(service.get(eq("A4J2KQ"))).thenReturn(new Echo("id-1", "A4J2KQ", "conductor-1"));

        mockMvc.perform(get("/api/echoes/A4J2KQ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A4J2KQ"));
    }

    @Test
    void getMissingReturns404() throws Exception {
        when(service.get(eq("ZZZZZZ"))).thenThrow(new EchoNotFoundException("ZZZZZZ"));

        mockMvc.perform(get("/api/echoes/ZZZZZZ"))
                .andExpect(status().isNotFound());
    }
}
