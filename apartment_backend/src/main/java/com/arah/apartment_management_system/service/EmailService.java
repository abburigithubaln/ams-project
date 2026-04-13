package com.arah.apartment_management_system.service;

public interface EmailService {

    void sendResetPasswordEmail(String toEmail, String token);

    void sendPaymentReminder(String toEmail, String residentName, String flatNumber, double amount, String dueDate);
}