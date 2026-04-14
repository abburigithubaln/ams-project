package com.arah.apartment_management_system.service;

import com.razorpay.Order;

public interface PaymentService {

    Order createOrder(int amount);

    boolean verifyPayment(String paymentId, String orderId, String signature);
}
