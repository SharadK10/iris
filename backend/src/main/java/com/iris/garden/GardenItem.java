package com.iris.garden;

import com.iris.bloom.Bloom;

public record GardenItem(
        String id,
        Bloom bloom,
        String addedBy
) {
}
