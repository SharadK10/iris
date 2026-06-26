package com.iris.youtube;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Raised when YouTube rejects a search for quota/rate reasons (HTTP 429 or 403).
 * Surfaced to the client as 429 so it can show a "try later" message instead of
 * a generic 500.
 */
@ResponseStatus(value = HttpStatus.TOO_MANY_REQUESTS, reason = "Search limit reached")
public class SearchRateLimitedException extends RuntimeException {
}
