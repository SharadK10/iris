package com.iris.press;

import org.springframework.data.jpa.repository.JpaRepository;

/** Durable store for pressed (paid, permanent) letters. */
public interface PressedLetterRepository extends JpaRepository<PressedLetter, String> {
}
