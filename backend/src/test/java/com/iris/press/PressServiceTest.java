package com.iris.press;

import com.iris.letter.LetterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PressServiceTest {

    private static final String SECRET = "webhook_secret_123";

    @Mock
    LetterService letters;
    @Mock
    PaymentRepository payments;

    private PressService service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-08-05T00:00:00Z"), ZoneOffset.UTC);
        // No Razorpay key id -> no client is built; only the webhook path is exercised here.
        service = new PressService(letters, payments, clock, "", "", SECRET, 4900, "INR");
    }

    @Test
    void pressesLetterOnPaidOrderWebhook() {
        String payload = orderPaid("order_abc");
        Payment payment = new Payment("order_abc", "letter_1", 4900, "INR", Instant.EPOCH);
        when(payments.findById("order_abc")).thenReturn(Optional.of(payment));

        service.handleWebhook(payload, sign(payload));

        verify(letters).press("letter_1");
        assertThat(payment.getStatus()).isEqualTo(Payment.PAID);
        verify(payments).save(payment);
    }

    @Test
    void extractsOrderIdFromPaymentCapturedEvent() {
        String payload = paymentCaptured("order_xyz");
        Payment payment = new Payment("order_xyz", "letter_2", 4900, "INR", Instant.EPOCH);
        when(payments.findById("order_xyz")).thenReturn(Optional.of(payment));

        service.handleWebhook(payload, sign(payload));

        verify(letters).press("letter_2");
    }

    @Test
    void isIdempotentForAlreadyPaidOrder() {
        String payload = orderPaid("order_abc");
        Payment payment = new Payment("order_abc", "letter_1", 4900, "INR", Instant.EPOCH);
        payment.setStatus(Payment.PAID);
        when(payments.findById("order_abc")).thenReturn(Optional.of(payment));

        service.handleWebhook(payload, sign(payload));

        verify(letters, never()).press("letter_1");
        verify(payments, never()).save(payment);
    }

    @Test
    void redeliveryDoesNotPressTwice() {
        String payload = orderPaid("order_abc");
        Payment payment = new Payment("order_abc", "letter_1", 4900, "INR", Instant.EPOCH);
        when(payments.findById("order_abc")).thenReturn(Optional.of(payment));

        service.handleWebhook(payload, sign(payload)); // status flips to PAID
        service.handleWebhook(payload, sign(payload)); // now a no-op

        verify(letters, times(1)).press("letter_1");
    }

    @Test
    void rejectsBadSignature() {
        String payload = orderPaid("order_abc");
        assertThatThrownBy(() -> service.handleWebhook(payload, "deadbeef"))
                .isInstanceOf(InvalidWebhookException.class);
        verify(letters, never()).press(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void ignoresUnknownOrder() {
        String payload = orderPaid("order_missing");
        when(payments.findById("order_missing")).thenReturn(Optional.empty());

        service.handleWebhook(payload, sign(payload)); // no throw

        verify(letters, never()).press(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void ignoresUnrelatedEvents() {
        String payload = "{\"event\":\"payment.failed\",\"payload\":{}}";
        service.handleWebhook(payload, sign(payload));
        verify(letters, never()).press(org.mockito.ArgumentMatchers.anyString());
    }

    private static String orderPaid(String orderId) {
        return "{\"event\":\"order.paid\",\"payload\":{\"order\":{\"entity\":{\"id\":\"" + orderId + "\"}}}}";
    }

    private static String paymentCaptured(String orderId) {
        return "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"entity\":{\"order_id\":\""
                + orderId + "\"}}}}";
    }

    /** Mirrors Razorpay's webhook signature: hex HMAC-SHA256 of the raw body. */
    private static String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
