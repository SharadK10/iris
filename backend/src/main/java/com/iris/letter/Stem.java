package com.iris.letter;

import com.iris.bloom.Bloom;

/**
 * One flower in the bouquet: a Bloom with an optional Note beside it.
 * Never surfaced by name in the UI — listeners only ever see the Bloom and its Note.
 */
public record Stem(
        String id,
        Bloom bloom,
        String note
) {
}
