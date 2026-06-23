package com.iris.youtube;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.SERVICE_UNAVAILABLE, reason = "Search is not configured")
public class SearchUnavailableException extends RuntimeException {
}
