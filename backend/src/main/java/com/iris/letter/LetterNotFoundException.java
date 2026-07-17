package com.iris.letter;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class LetterNotFoundException extends RuntimeException {

    public LetterNotFoundException(String id) {
        super("No letter found for id " + id);
    }
}
