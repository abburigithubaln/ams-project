package com.arah.apartment_management_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.arah.apartment_management_system.entity.Payment;
import com.arah.apartment_management_system.repository.PaymentRepository;
import com.arah.apartment_management_system.service.PaymentService;
import com.razorpay.Order;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestParam int amount) throws Exception {
        Order order = paymentService.createOrder(amount);

        Map<String, Object> response = new HashMap<>();
        response.put("id", order.get("id"));
        response.put("amount", order.get("amount"));
        response.put("currency", order.get("currency"));
        response.put("receipt", order.get("receipt"));
        response.put("status", order.get("status"));

        return response;
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> data) {
        String paymentId = data.get("razorpayPaymentId");
        String orderId = data.get("razorpayOrderId");
        String signature = data.get("razorpaySignature");
        String amountStr = data.get("amount");

        Map<String, Object> response = new HashMap<>();

        boolean isValid = paymentService.verifyPayment(paymentId, orderId, signature);

        if (isValid) {
            // Save payment record to DB
            Payment payment = new Payment();
            payment.setPaymentId(paymentId);
            payment.setOrderId(orderId);
            payment.setStatus("SUCCESS");
            if (amountStr != null) {
                try {
                    payment.setAmount(Double.parseDouble(amountStr));
                } catch (NumberFormatException ignored) {
                }
            }
            paymentRepository.save(payment);

            response.put("success", true);
            response.put("message", "Payment verified and saved successfully");
            return ResponseEntity.ok(response);
        }

        response.put("success", false);
        response.put("message", "Payment verification failed — invalid signature");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
