package com.donilogistics.entity;

import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.JmixEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JmixEntity
@Table(name = "TRACKING_EVENT")
@Entity
public class TrackingEvent {
    @JmixGeneratedValue
    @Column(name = "ID", nullable = false)
    @Id
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SHIPMENT_ID")
    private Shipment shipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONSOLIDATION_ID")
    private Consolidation consolidation;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "EVENT_TYPE", nullable = false, length = 50)
    private TrackingEventType eventType;

    @Column(name = "LATITUDE", precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(name = "LONGITUDE", precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "HEADING", precision = 5, scale = 2)
    private BigDecimal heading; // in degrees

    @Column(name = "SPEED", precision = 5, scale = 2)
    private BigDecimal speed; // in km/h

    @Column(name = "ACCURACY", precision = 5, scale = 2)
    private BigDecimal accuracy; // in meters

    @Column(name = "RECORDED_AT", nullable = false)
    @NotNull
    private LocalDateTime recordedAt;

    @Column(name = "RECEIVED_AT", nullable = false)
    @NotNull
    private LocalDateTime receivedAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "SOURCE", nullable = false, length = 50)
    private TrackingSource source;

    @Column(name = "RAW_PAYLOAD", length = 4000)
    private String rawPayload; // JSON string

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization;

    @PrePersist
    protected void onCreate() {
        if (receivedAt == null) {
            receivedAt = LocalDateTime.now();
        }
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public void setShipment(Shipment shipment) {
        this.shipment = shipment;
    }

    public Consolidation getConsolidation() {
        return consolidation;
    }

    public void setConsolidation(Consolidation consolidation) {
        this.consolidation = consolidation;
    }

    public TrackingEventType getEventType() {
        return eventType;
    }

    public void setEventType(TrackingEventType eventType) {
        this.eventType = eventType;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public BigDecimal getHeading() {
        return heading;
    }

    public void setHeading(BigDecimal heading) {
        this.heading = heading;
    }

    public BigDecimal getSpeed() {
        return speed;
    }

    public void setSpeed(BigDecimal speed) {
        this.speed = speed;
    }

    public BigDecimal getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(BigDecimal accuracy) {
        this.accuracy = accuracy;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public TrackingSource getSource() {
        return source;
    }

    public void setSource(TrackingSource source) {
        this.source = source;
    }

    public String getRawPayload() {
        return rawPayload;
    }

    public void setRawPayload(String rawPayload) {
        this.rawPayload = rawPayload;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }
}
