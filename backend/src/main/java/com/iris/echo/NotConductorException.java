package com.iris.echo;

public class NotConductorException extends RuntimeException {

    public NotConductorException() {
        super("Only the conductor can control playback");
    }
}
