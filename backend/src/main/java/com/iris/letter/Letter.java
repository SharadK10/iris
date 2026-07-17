package com.iris.letter;

import java.util.ArrayList;
import java.util.List;

/**
 * A Letter: an async gift carrying a Bouquet of Blooms, each with an optional Note.
 * Written once, sealed, and sent as a link. Opened later by the recipient.
 */
public class Letter {

    private String id;
    private String recipient;   // "Dear ___"    (optional)
    private String sender;      // "Yours, ___"  (optional)
    private String opening;     // opening message shown after the salutation (optional)
    private List<Stem> bouquet = new ArrayList<>();
    private boolean opened;
    private Long openedAt;
    private long sealedAt;

    public Letter() {
    }

    public Letter(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getOpening() {
        return opening;
    }

    public void setOpening(String opening) {
        this.opening = opening;
    }

    public List<Stem> getBouquet() {
        return bouquet;
    }

    public void setBouquet(List<Stem> bouquet) {
        this.bouquet = bouquet;
    }

    public boolean isOpened() {
        return opened;
    }

    public void setOpened(boolean opened) {
        this.opened = opened;
    }

    public Long getOpenedAt() {
        return openedAt;
    }

    public void setOpenedAt(Long openedAt) {
        this.openedAt = openedAt;
    }

    public long getSealedAt() {
        return sealedAt;
    }

    public void setSealedAt(long sealedAt) {
        this.sealedAt = sealedAt;
    }
}
