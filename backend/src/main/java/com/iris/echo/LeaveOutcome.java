package com.iris.echo;

/**
 * Result of a listener leaving an echo. Carries the updated echo plus, when the
 * departing listener was the conductor, who inherited the role so the socket
 * layer can announce the change.
 */
public record LeaveOutcome(
        Echo echo,
        boolean conductorChanged,
        String leaverNickname,
        String newConductorNickname
) {
}
