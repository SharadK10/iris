package com.iris.youtube;

import com.iris.bloom.Bloom;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SearchController {

    private final YoutubeService youtube;

    public SearchController(YoutubeService youtube) {
        this.youtube = youtube;
    }

    @GetMapping("/api/search")
    public List<Bloom> search(@RequestParam("q") String query) {
        return youtube.search(query);
    }
}
