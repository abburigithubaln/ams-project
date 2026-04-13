package com.arah.apartment_management_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.arah.apartment_management_system.service.EmailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendResetPasswordEmail(String toEmail, String token) {

        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("lachochow1991@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password - BR Meadowlands");

            String htmlContent =
                    "<div style='font-family:Arial,sans-serif; background-color:#f4f6f8; padding:30px;'>"
                            + "<div style='max-width:600px; margin:auto; background:white; padding:30px; border-radius:8px;'>"
                            + "<h2 style='color:#2c3e50; text-align:center;'>BR Meadowlands</h2>"
                            + "<p>Hello,</p>"
                            + "<p>We received a request to reset your password.</p>"
                            + "<p style='text-align:center;'>"
                            + "<a href='" + resetLink + "' "
                            + "style='background-color:#007bff; color:white; padding:12px 20px; "
                            + "text-decoration:none; border-radius:5px; font-weight:bold;'>"
                            + "Reset Password"
                            + "</a>"
                            + "</p>"
                            + "<p>This link will expire in <b>15 minutes</b>.</p>"
                            + "<p>If you did not request this, please ignore this email.</p>"
                            + "<hr style='margin:20px 0;'>"
                            + "<p style='font-size:12px; color:gray; text-align:center;'>"
                            + "© 2026 BR Meadowlands Apartment Management System"
                            + "</p>"
                            + "</div>"
                            + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendPaymentReminder(String toEmail, String residentName, String flatNumber, double amount, String dueDate) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("lachochow1991@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Maintenance Payment Reminder - BR Meadowlands");

            String htmlContent =
                    "<div style='font-family:Arial,sans-serif; background-color:#f4f6f8; padding:30px;'>"
                            + "<div style='max-width:600px; margin:auto; background:white; padding:30px; border-radius:8px; border-top:4px solid #e74c3c;'>"
                            + "<h2 style='color:#2c3e50; text-align:center;'>BR Meadowlands</h2>"
                            + "<p>Dear <b>" + residentName + "</b>,</p>"
                            + "<p>This is a friendly reminder that your maintenance payment is pending.</p>"
                            + "<table style='width:100%; border-collapse:collapse; margin:20px 0;'>"
                            + "<tr style='background:#f8f9fa;'><td style='padding:10px; border:1px solid #dee2e6;'><b>Flat Number</b></td><td style='padding:10px; border:1px solid #dee2e6;'>" + flatNumber + "</td></tr>"
                            + "<tr><td style='padding:10px; border:1px solid #dee2e6;'><b>Amount Due</b></td><td style='padding:10px; border:1px solid #dee2e6; color:#e74c3c;'><b>&#x20B9;" + String.format("%.2f", amount) + "</b></td></tr>"
                            + "<tr style='background:#f8f9fa;'><td style='padding:10px; border:1px solid #dee2e6;'><b>Due Date</b></td><td style='padding:10px; border:1px solid #dee2e6;'>" + dueDate + "</td></tr>"
                            + "</table>"
                            + "<p>Please make your payment at the earliest to avoid late fees.</p>"
                            + "<hr style='margin:20px 0;'>"
                            + "<p style='font-size:12px; color:gray; text-align:center;'>&#169; 2026 BR Meadowlands Apartment Management System</p>"
                            + "</div>"
                            + "</div>";

            helper.setText(htmlContent, true);
            System.out.println("Attempting to send payment reminder to: " + toEmail);
            mailSender.send(message);
            System.out.println("Email sent successfully!");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send payment reminder: " + e.getMessage(), e);
        }
    }
}