package com.iris.echo;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class EchoNotFoundException extends RuntimeException {

    public EchoNotFoundException(String code) {
        super("No echo found for code " + code);
    }
}
