package com.iris.press;

/**
 * What the browser needs to open the Razorpay checkout modal for a press:
 * the created order id, the public key id, and the amount/currency to display.
 */
public record CheckoutResponse(
        String orderId,
        String keyId,
        long amount,
        String currency
) {
}
