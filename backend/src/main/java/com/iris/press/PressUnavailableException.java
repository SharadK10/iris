package com.iris.press;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Raised when pressing is requested but Razorpay isn't configured on this deployment. */
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class PressUnavailableException extends RuntimeException {

    public PressUnavailableException(String message) {
        super(message);
    }
}
