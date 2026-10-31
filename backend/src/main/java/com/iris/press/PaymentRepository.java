package com.iris.press;

import org.springframework.data.jpa.repository.JpaRepository;

/** Audit + idempotency store for press payments, keyed by Razorpay order id. */
public interface PaymentRepository extends JpaRepository<Payment, String> {
}
