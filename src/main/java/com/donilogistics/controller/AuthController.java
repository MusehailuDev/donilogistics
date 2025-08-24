package com.donilogistics.controller;

import com.donilogistics.entity.User;
import io.jmix.core.DataManager;
import io.jmix.core.security.SystemAuthenticator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private DataManager dataManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SystemAuthenticator systemAuthenticator;

    @PostMapping(value = "/login", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
        try {
            String username = body == null ? "" : String.valueOf(body.getOrDefault("username", "")).trim();
            String password = body == null ? "" : String.valueOf(body.getOrDefault("password", ""));

            // Short-circuit for admin/admin to avoid any DB access during initial setup
            if ("admin".equalsIgnoreCase(username) && "admin".equals(password)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                Map<String, Object> userDto = new HashMap<>();
                userDto.put("id", "00000000-0000-0000-0000-000000000001");
                userDto.put("username", "admin");
                userDto.put("email", "admin@local");
                userDto.put("firstName", "Admin");
                userDto.put("lastName", "User");
                userDto.put("userRole", "SUPER_ADMIN");
                // omit organization when null
                response.put("user", userDto);
                response.put("message", "Login successful");
                return ResponseEntity.ok(response);
            }

            // Execute DataManager operations under system authentication
            Optional<User> userOpt = systemAuthenticator.withSystem(() ->
                    dataManager.load(User.class)
                            .query("SELECT u FROM User u WHERE u.username = :username OR u.email = :email")
                            .parameter("username", username)
                            .parameter("email", username)
                            .optional()
            );

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
            }

            User user = userOpt.get();

            // Check if email is verified for non-admin users (null-safe)
            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email not verified"));
            }

            // Check password for other users
            if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            Map<String, Object> userDto = new HashMap<>();
            userDto.put("id", user.getId());
            userDto.put("username", user.getUsername());
            userDto.put("email", user.getEmail());
            userDto.put("firstName", user.getFirstName());
            userDto.put("lastName", user.getLastName());
            if (user.getUserRole() != null) {
                userDto.put("userRole", user.getUserRole());
            }
            if (user.getOrganization() != null) {
                Map<String, Object> orgDto = new HashMap<>();
                orgDto.put("id", user.getOrganization().getId());
                orgDto.put("name", user.getOrganization().getName());
                userDto.put("organization", orgDto);
            }
            response.put("user", userDto);
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + (e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage())));
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth() {
        return ResponseEntity.ok(Map.of("status", "API is running"));
    }

    // Email verification endpoint (POST for API calls)
    @PostMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, Object> body) {
        try {
            String token = body == null ? "" : String.valueOf(body.getOrDefault("token", "")).trim();
            if (token.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token is required"));
            }
            
            Optional<User> userOpt = systemAuthenticator.withSystem(() ->
                    dataManager.load(User.class)
                            .query("select u from User u where u.emailVerificationToken = :t")
                            .parameter("t", token)
                            .optional()
            );
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
            }
            User user = userOpt.get();
            
            // Check if token is expired
            if (user.getEmailVerificationExpires() != null && 
                user.getEmailVerificationExpires().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Verification token has expired"));
            }
            
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setEmailVerificationExpires(null);
            systemAuthenticator.withSystem(() -> dataManager.save(user));
            return ResponseEntity.ok(Map.of("success", true, "message", "Email verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Email verification endpoint (GET for direct links from email)
    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmailGet(@RequestParam("token") String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token is required"));
            }
            
            Optional<User> userOpt = systemAuthenticator.withSystem(() ->
                    dataManager.load(User.class)
                            .query("select u from User u where u.emailVerificationToken = :t")
                            .parameter("t", token.trim())
                            .optional()
            );
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
            }
            User user = userOpt.get();
            
            // Check if token is expired
            if (user.getEmailVerificationExpires() != null && 
                user.getEmailVerificationExpires().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Verification token has expired"));
            }
            
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setEmailVerificationExpires(null);
            systemAuthenticator.withSystem(() -> dataManager.save(user));
            
            // Redirect to frontend with success message
            return ResponseEntity.status(302)
                    .header("Location", "http://localhost:3000/verify?status=success&message=Email verified successfully")
                    .build();
        } catch (Exception e) {
            // Redirect to frontend with error message
            return ResponseEntity.status(302)
                    .header("Location", "http://localhost:3000/verify?status=error&message=" + e.getMessage())
                    .build();
        }
    }

    // Dev-only helper to mark a user's email as verified quickly
    @PostMapping("/dev/verify")
    public ResponseEntity<?> devVerify(@RequestBody Map<String, Object> body) {
        try {
            String username = body == null ? "" : String.valueOf(body.getOrDefault("username", "")).trim();
            if (username.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "username is required"));
            }
            return systemAuthenticator.withSystem(() -> {
                Optional<User> userOpt = dataManager.load(User.class)
                        .query("select u from User u where u.username = :u or u.email = :u")
                        .parameter("u", username)
                        .optional();
                if (userOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
                }
                User user = userOpt.get();
                user.setEmailVerified(true);
                user.setEmailVerificationToken(null);
                dataManager.save(user);
                return ResponseEntity.ok(Map.of("success", true));
            });
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Legacy DTO kept for reference
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
