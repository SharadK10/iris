package com.iris.press;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Raised when a webhook's signature can't be verified against the shared secret. */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidWebhookException extends RuntimeException {

    public InvalidWebhookException(String message) {
        super(message);
    }
}
