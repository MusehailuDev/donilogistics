package com.donilogistics.service;

import com.donilogistics.entity.Organization;
import com.donilogistics.entity.User;
import com.donilogistics.entity.UserRole;
import io.jmix.core.DataManager;
import io.jmix.core.Id;
import io.jmix.core.security.SystemAuthenticator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service("doni_UserRegistrationService")
public class UserRegistrationService {

    @Autowired
    private DataManager dataManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SystemAuthenticator systemAuthenticator;

    @Autowired
    private EmailService emailService;

    @Transactional
    public String registerUser(String username, String email, String password, String firstName,
                           String lastName, String phoneNumber, String address,
                           UUID organizationId, UserRole userRole) {
        return systemAuthenticator.withSystem(() -> {
            // Check if username already exists
            if (isUsernameExists(username)) {
                throw new RuntimeException("Username already exists");
            }

            // Check if email already exists
            if (isEmailExists(email)) {
                throw new RuntimeException("Email already exists");
            }

            // Get organization
            Organization organization = dataManager.load(Organization.class)
                    .id(organizationId)
                    .one();

            // Create user
            User user = dataManager.create(User.class);
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhoneNumber(phoneNumber);
            user.setAddress(address);
            user.setOrganization(organization);
            user.setUserRole(userRole);
            user.setActive(true);
            user.setEmailVerified(false);

            // Generate email verification token
            String verificationToken = UUID.randomUUID().toString();
            user.setEmailVerificationToken(verificationToken);
            user.setEmailVerificationExpires(LocalDateTime.now().plusHours(24));

            // Save user
            User savedUser = dataManager.save(user);

            // Send verification email
            emailService.sendVerificationEmail(savedUser);

            return "OK";
        });
    }

    @Transactional
    public boolean verifyEmail(String token) {
        return systemAuthenticator.withSystem(() -> {
            User user = dataManager.load(User.class)
                    .query("select u from User u where u.emailVerificationToken = :token")
                    .parameter("token", token)
                    .optional()
                    .orElse(null);

            if (user == null) {
                return false;
            }

            if (user.getEmailVerificationExpires().isBefore(LocalDateTime.now())) {
                return false;
            }

            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setEmailVerificationExpires(null);
            dataManager.save(user);

            return true;
        });
    }

    @Transactional
    public List<java.util.Map<String, Object>> getActiveOrganizations() {
        return systemAuthenticator.withSystem(() ->
                dataManager.load(Organization.class)
                        .query("select o from Organization o where o.active = true order by o.name")
                        .list()
                        .stream()
                        .map(o -> {
                            java.util.Map<String, Object> m = new java.util.HashMap<>();
                            m.put("id", o.getId());
                            m.put("name", o.getName());
                            m.put("code", o.getCode());
                            m.put("active", o.getActive());
                            m.put("orgType", o.getOrgType());
                            return m;
                        })
                        .toList()
        );
    }

    private boolean isUsernameExists(String username) {
        return dataManager.load(User.class)
                .query("select u from User u where u.username = :username")
                .parameter("username", username)
                .optional()
                .isPresent();
    }

    private boolean isEmailExists(String email) {
        return dataManager.load(User.class)
                .query("select u from User u where u.email = :email")
                .parameter("email", email)
                .optional()
                .isPresent();
    }
}
