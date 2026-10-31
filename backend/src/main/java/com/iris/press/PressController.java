package com.iris.press;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PressController {

    private final PressService press;

    public PressController(PressService press) {
        this.press = press;
    }

    /** The one-time price to press a letter, so the UI can show it before checkout. */
    @GetMapping("/api/press/price")
    public PressPrice price() {
        return press.price();
    }

    /** Starts checkout to press (pay to keep forever) a letter. */
    @PostMapping("/api/letters/{id}/press")
    public CheckoutResponse press(@PathVariable String id) {
        return press.createOrder(id);
    }

    /** Razorpay payment webhook — the source of truth for granting permanence. */
    @PostMapping("/api/payments/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String payload,
                                        @RequestHeader("X-Razorpay-Signature") String signature) {
        press.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}
