package com.iris.press;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * The durable copy of a "pressed" letter — one that was paid for and kept forever.
 * The full Letter is stored as its JSON {@code payload}; Redis holds a warm,
 * non-expiring mirror for reads. This table is the source of truth for permanence.
 */
@Entity
@Table(name = "letters")
public class PressedLetter {

    @Id
    private String id;

    @Column(columnDefinition = "text", nullable = false)
    private String payload;

    @Column(nullable = false)
    private boolean permanent;

    private Instant paidAt;

    @Column(nullable = false)
    private Instant createdAt;

    protected PressedLetter() {
    }

    public PressedLetter(String id, String payload, Instant paidAt, Instant createdAt) {
        this.id = id;
        this.payload = payload;
        this.permanent = true;
        this.paidAt = paidAt;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public boolean isPermanent() {
        return permanent;
    }

    public void setPermanent(boolean permanent) {
        this.permanent = permanent;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
