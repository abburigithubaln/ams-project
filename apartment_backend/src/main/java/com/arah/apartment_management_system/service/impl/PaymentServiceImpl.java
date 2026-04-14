package com.arah.apartment_management_system.service.impl;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.entity.Payment;
import com.arah.apartment_management_system.repository.PaymentRepository;
import com.arah.apartment_management_system.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public Order createOrder(int amount) {
        try {
            if (keyId == null || keyId.trim().isEmpty() || keySecret == null || keySecret.trim().isEmpty()) {
                throw new RuntimeException("Razorpay Keys are not configured in application.properties");
            }
            System.out.println("Creating Razorpay order for amount: " + amount + " using Key ID: " + keyId.substring(0, 10) + "...");
            RazorpayClient client = new RazorpayClient(keyId.trim(), keySecret.trim());

            JSONObject options = new JSONObject();
            options.put("amount", amount * 100);
            options.put("currency", "INR");
            options.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = client.orders.create(options);
            System.out.println("Order created successfully: " + order.get("id"));
            return order;
        } catch (RazorpayException e) {
            System.err.println("RazorpayException: " + e.getMessage());
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("General Exception in createOrder: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Internal Error: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyPayment(String paymentId, String orderId, String signature) {
        try {
            // Generate HMAC-SHA256 signature using: orderId + "|" + paymentId
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(keySecret.trim().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            String generatedSignature = hexString.toString();

            boolean isValid = generatedSignature.equals(signature);
            System.out.println("Signature verification: " + (isValid ? "VALID" : "INVALID"));
            return isValid;
        } catch (Exception e) {
            System.err.println("Signature verification error: " + e.getMessage());
            return false;
        }
    }

    public Payment savePayment(String paymentId, String orderId, String signature, Double amount) {
        Payment payment = new Payment();
        payment.setPaymentId(paymentId);
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setStatus("SUCCESS");
        return paymentRepository.save(payment);
    }
}
