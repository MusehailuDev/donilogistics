package com.donilogistics.service;

import com.donilogistics.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service("doni_EmailService")
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@localhost}")
    private String fromAddress;

    @Value("${app.public-url:http://localhost:3000}")
    private String publicUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(User user) {
        String token = user.getEmailVerificationToken();
        String verifyLink = publicUrl.replaceAll("/$", "") + "/verify?token=" + token;

        String subject = "Verify your Doni Logistics account";
        String text = "Hello " + (user.getFirstName() != null ? user.getFirstName() : user.getUsername()) + ",\n\n"
                + "Thanks for registering with Doni Logistics. Please verify your email by clicking the link below:\n\n"
                + verifyLink + "\n\n"
                + "If you did not sign up, please ignore this email.";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(user.getEmail());
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception ex) {
            // Fallback to console logging in dev
            System.out.println("[DEV] Could not send email via SMTP. Printing verification link instead.");
            System.out.println("Verification email (to " + user.getEmail() + ") link: " + verifyLink);
        }
    }

    public void sendPasswordResetEmail(User user, String resetToken) {
        String resetLink = publicUrl.replaceAll("/$", "") + "/api/auth/reset-password?token=" + resetToken;
        String subject = "Reset your Doni Logistics password";
        String text = "Hello " + (user.getFirstName() != null ? user.getFirstName() : user.getUsername()) + ",\n\n"
                + "Use the link below to reset your password:\n\n" + resetLink;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(user.getEmail());
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception ex) {
            System.out.println("[DEV] Could not send reset email via SMTP. Link: " + resetLink);
        }
    }
}
