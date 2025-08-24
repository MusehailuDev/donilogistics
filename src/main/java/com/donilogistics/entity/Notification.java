package com.donilogistics.entity;

import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.JmixEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@JmixEntity
@Entity
@Table(name = "NOTIFICATION", indexes = {
        @Index(name = "IDX_NOTIFICATION_ON_RECIPIENT", columnList = "RECIPIENT_USER_ID"),
        @Index(name = "IDX_NOTIFICATION_ON_CREATED_AT", columnList = "CREATED_AT")
})
public class Notification {

    @Id
    @Column(name = "ID")
    @JmixGeneratedValue
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", length = 50)
    private NotificationType type = NotificationType.GENERAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "CHANNEL", length = 20)
    private NotificationChannel channel = NotificationChannel.IN_APP;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "TITLE", length = 255)
    private String title;

    @Column(name = "MESSAGE", length = 4000)
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RECIPIENT_USER_ID")
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SHIPMENT_ID")
    private Shipment shipment;

    @Column(name = "READ_")
    private Boolean read = Boolean.FALSE;

    @Column(name = "READ_AT")
    private LocalDateTime readAt;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "DELIVERED_AT")
    private LocalDateTime deliveredAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }
    public NotificationStatus getStatus() { return status; }
    public void setStatus(NotificationStatus status) { this.status = status; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
    public Shipment getShipment() { return shipment; }
    public void setShipment(Shipment shipment) { this.shipment = shipment; }
    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
}


