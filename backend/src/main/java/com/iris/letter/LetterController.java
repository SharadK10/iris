package com.iris.letter;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/letters")
public class LetterController {

    private final LetterService service;

    public LetterController(LetterService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Letter create(@RequestBody CreateLetterRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}")
    public Letter get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping("/{id}/open")
    public Letter open(@PathVariable String id) {
        return service.open(id);
    }
}
