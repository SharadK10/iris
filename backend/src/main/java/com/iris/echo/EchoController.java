package com.iris.echo;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/echoes")
public class EchoController {

    private final EchoService service;

    public EchoController(EchoService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Echo create() {
        return service.create();
    }

    @GetMapping("/{code}")
    public Echo get(@PathVariable String code) {
        return service.get(code);
    }
}
