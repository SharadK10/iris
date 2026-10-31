package com.iris.press;

import com.iris.letter.Letter;
import com.iris.letter.LetterService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Clock;

/**
 * Pressing a letter: a one-time Razorpay payment that promotes it to permanent.
 *
 * <p>The browser starts checkout via {@link #createOrder}; permanence is only ever
 * granted from {@link #handleWebhook}, whose signature is verified server-side — the
 * client's success callback is for UX only and is never trusted to grant permanence.
 */
@Service
public class PressService {

    private static final Logger log = LoggerFactory.getLogger(PressService.class);

    private final LetterService letters;
    private final PaymentRepository payments;
    private final Clock clock;

    private final String keyId;
    private final String webhookSecret;
    private final long amountPaise;
    private final String currency;
    private final RazorpayClient client;

    public PressService(LetterService letters,
                        PaymentRepository payments,
                        Clock clock,
                        @Value("${iris.razorpay.key-id}") String keyId,
                        @Value("${iris.razorpay.key-secret}") String keySecret,
                        @Value("${iris.razorpay.webhook-secret}") String webhookSecret,
                        @Value("${iris.press.amount-paise}") long amountPaise,
                        @Value("${iris.press.currency}") String currency) {
        this.letters = letters;
        this.payments = payments;
        this.clock = clock;
        this.keyId = keyId;
        this.webhookSecret = webhookSecret;
        this.amountPaise = amountPaise;
        this.currency = currency;
        this.client = buildClient(keyId, keySecret);
    }

    private static RazorpayClient buildClient(String keyId, String keySecret) {
        if (keyId == null || keyId.isBlank()) {
            return null; // Pressing is disabled until Razorpay keys are configured.
        }
        try {
            return new RazorpayClient(keyId, keySecret);
        } catch (RazorpayException e) {
            throw new IllegalStateException("Failed to initialise Razorpay client", e);
        }
    }

    /** The configured one-time press price, for the UI to show before checkout. */
    public PressPrice price() {
        return new PressPrice(amountPaise, currency);
    }

    /**
     * Creates a Razorpay order for pressing the given letter and records it. Reading
     * the letter first refreshes its Redis TTL, so it survives the checkout round-trip.
     */
    public CheckoutResponse createOrder(String letterId) {
        if (client == null) {
            throw new PressUnavailableException("Pressing is not configured on this server.");
        }
        Letter letter = letters.get(letterId); // 404s if the letter is gone; refreshes TTL
        if (letter.isPermanent()) {
            throw new AlreadyPressedException(letterId);
        }

        JSONObject notes = new JSONObject();
        notes.put("letterId", letter.getId());

        JSONObject options = new JSONObject();
        options.put("amount", amountPaise);
        options.put("currency", currency);
        // Razorpay caps receipt at 40 chars; the 36-char letter id fits (and notes carries it too).
        options.put("receipt", letter.getId());
        options.put("notes", notes);

        try {
            Order order = client.orders.create(options);
            String orderId = order.get("id");
            payments.save(new Payment(orderId, letter.getId(), amountPaise, currency, clock.instant()));
            return new CheckoutResponse(orderId, keyId, amountPaise, currency);
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed for letter {}", letter.getId(), e);
            throw new PressUnavailableException("Could not start checkout: " + e.getMessage());
        }
    }

    /**
     * Handles a Razorpay webhook. Verifies the signature, then — on a paid order —
     * presses the associated letter. Idempotent: redelivered webhooks for an already
     * paid order are no-ops.
     */
    public void handleWebhook(String payload, String signature) {
        verify(payload, signature);

        JSONObject event = new JSONObject(payload);
        String type = event.optString("event");
        if (!"order.paid".equals(type) && !"payment.captured".equals(type)) {
            return; // Not a paid-order signal we act on.
        }

        String orderId = extractOrderId(event);
        if (orderId == null) {
            return;
        }
        Payment payment = payments.findById(orderId).orElse(null);
        if (payment == null || Payment.PAID.equals(payment.getStatus())) {
            return; // Unknown order, or already handled — nothing to do.
        }

        letters.press(payment.getLetterId());
        payment.setStatus(Payment.PAID);
        payment.setPaidAt(clock.instant());
        payments.save(payment);
        log.info("Pressed letter {} via order {}", payment.getLetterId(), orderId);
    }

    private void verify(String payload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new PressUnavailableException("Webhook secret is not configured.");
        }
        try {
            if (!Utils.verifyWebhookSignature(payload, signature, webhookSecret)) {
                throw new InvalidWebhookException("Signature mismatch.");
            }
        } catch (RazorpayException e) {
            throw new InvalidWebhookException("Could not verify signature: " + e.getMessage());
        }
    }

    /** Pulls the order id out of an order.paid or payment.captured event. */
    private String extractOrderId(JSONObject event) {
        JSONObject data = event.optJSONObject("payload");
        if (data == null) {
            return null;
        }
        JSONObject order = entity(data.optJSONObject("order"));
        if (order != null && order.has("id")) {
            return order.getString("id");
        }
        JSONObject payment = entity(data.optJSONObject("payment"));
        if (payment != null && payment.has("order_id") && !payment.isNull("order_id")) {
            return payment.getString("order_id");
        }
        return null;
    }

    private JSONObject entity(JSONObject wrapper) {
        return wrapper == null ? null : wrapper.optJSONObject("entity");
    }
}
