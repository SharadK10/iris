package com.iris.press;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class AlreadyPressedException extends RuntimeException {

    public AlreadyPressedException(String id) {
        super("Letter " + id + " is already pressed.");
    }
}
