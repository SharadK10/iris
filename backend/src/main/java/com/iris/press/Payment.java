package com.iris.press;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * A record of a press payment, keyed by the Razorpay order id. Doubles as the
 * idempotency guard for webhook delivery: once {@code status} is PAID, redelivered
 * webhooks are no-ops.
 */
@Entity
@Table(name = "payments")
public class Payment {

    public static final String CREATED = "CREATED";
    public static final String PAID = "PAID";

    @Id
    @Column(name = "order_id")
    private String orderId;

    @Column(nullable = false)
    private String letterId;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private long amount;

    private String currency;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant paidAt;

    protected Payment() {
    }

    public Payment(String orderId, String letterId, long amount, String currency, Instant createdAt) {
        this.orderId = orderId;
        this.letterId = letterId;
        this.status = CREATED;
        this.amount = amount;
        this.currency = currency;
        this.createdAt = createdAt;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getLetterId() {
        return letterId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }
}
