package com.donilogistics.service;

import com.donilogistics.entity.Notification;
import com.donilogistics.entity.NotificationChannel;
import com.donilogistics.entity.NotificationStatus;
import com.donilogistics.entity.NotificationType;
import com.donilogistics.entity.Organization;
import com.donilogistics.entity.Shipment;
import com.donilogistics.entity.User;
import io.jmix.core.DataManager;
import io.jmix.core.security.SystemAuthenticator;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class NotificationService {

    private final DataManager dataManager;
    private final SystemAuthenticator systemAuthenticator;

    public NotificationService(DataManager dataManager, SystemAuthenticator systemAuthenticator) {
        this.dataManager = dataManager;
        this.systemAuthenticator = systemAuthenticator;
    }

    public UUID notifyUser(UUID recipientUserId, String title, String message, NotificationType type, NotificationChannel channel, UUID shipmentId, UUID orgId) {
        return systemAuthenticator.withSystem(() -> {
            Notification n = dataManager.create(Notification.class);
            n.setTitle(title);
            n.setMessage(message);
            n.setType(type);
            n.setChannel(channel);
            n.setStatus(NotificationStatus.PENDING);
            if (recipientUserId != null) {
                User u = dataManager.load(User.class).id(recipientUserId).one();
                n.setRecipient(u);
            }
            if (shipmentId != null) {
                Shipment s = dataManager.load(Shipment.class).id(shipmentId).one();
                n.setShipment(s);
            }
            if (orgId != null) {
                Organization o = dataManager.load(Organization.class).id(orgId).one();
                n.setOrganization(o);
            }
            Notification saved = dataManager.save(n);
            return saved.getId();
        });
    }

    public void markDelivered(UUID notificationId) {
        systemAuthenticator.withSystem(() -> {
            Notification n = dataManager.load(Notification.class).id(notificationId).one();
            n.setStatus(NotificationStatus.SENT);
            n.setDeliveredAt(LocalDateTime.now());
            dataManager.save(n);
            return null;
        });
    }

    public void markRead(UUID notificationId) {
        systemAuthenticator.withSystem(() -> {
            Notification n = dataManager.load(Notification.class).id(notificationId).one();
            n.setRead(Boolean.TRUE);
            n.setReadAt(LocalDateTime.now());
            dataManager.save(n);
            return null;
        });
    }
}


