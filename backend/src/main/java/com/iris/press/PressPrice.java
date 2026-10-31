package com.iris.press;

/** The configured one-time price to press a letter, for display before checkout. */
public record PressPrice(long amount, String currency) {
}
