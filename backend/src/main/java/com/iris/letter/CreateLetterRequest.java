package com.iris.letter;

import com.iris.bloom.Bloom;

import java.util.List;

/**
 * The payload for writing a Letter: who it's to/from, an optional opening,
 * and the bouquet of blooms — each with an optional note.
 */
public record CreateLetterRequest(
        String recipient,
        String sender,
        String opening,
        List<PickedBloom> bouquet
) {

    public record PickedBloom(
            Bloom bloom,
            String note
    ) {
    }
}
