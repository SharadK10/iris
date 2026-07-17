package com.iris.letter;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidLetterException extends RuntimeException {

    public InvalidLetterException(String message) {
        super(message);
    }
}
