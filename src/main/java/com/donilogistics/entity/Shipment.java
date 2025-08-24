package com.donilogistics.entity;

import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.JmixEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JmixEntity
@Table(name = "SHIPMENT")
@Entity
public class Shipment {
    @JmixGeneratedValue
    @Column(name = "ID", nullable = false)
    @Id
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @Column(name = "EXTERNAL_ORDER_ID", length = 255)
    private String externalOrderId;

    @Column(name = "TRACKING_NUMBER", length = 100, unique = true)
    private String trackingNumber;

    @NotNull
    @Column(name = "STATUS", nullable = false, length = 50)
    private ShipmentStatus status;

    @Positive
    @Column(name = "WEIGHT_KG", precision = 19, scale = 2)
    private BigDecimal weightKg;

    @Positive
    @Column(name = "LENGTH_CM", precision = 10, scale = 2)
    private BigDecimal lengthCm;

    @Positive
    @Column(name = "WIDTH_CM", precision = 10, scale = 2)
    private BigDecimal widthCm;

    @Positive
    @Column(name = "HEIGHT_CM", precision = 10, scale = 2)
    private BigDecimal heightCm;

    @PositiveOrZero
    @Column(name = "VOLUME_M3", precision = 10, scale = 4)
    private BigDecimal volumeM3;

    @Column(name = "COMMODITY_TYPE", length = 100)
    private String commodityType; // fragile, hazmat, perishable, general

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PICKUP_ADDRESS_ID")
    private Address pickupAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DELIVERY_ADDRESS_ID")
    private Address deliveryAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CUSTOMER_ID")
    private Organization customer;

    @PositiveOrZero
    @Column(name = "DECLARED_VALUE", precision = 19, scale = 2)
    private BigDecimal declaredValue;

    @Column(name = "DIMS_CONFIRMED")
    private Boolean dimsConfirmed = false;

    @Column(name = "CONSOLIDATION_ALLOWED")
    private Boolean consolidationAllowed = true;

    @PositiveOrZero
    @Column(name = "CONSOLIDATION_PRIORITY")
    private Integer consolidationPriority = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENT_CONSOLIDATION_ID")
    private Consolidation parentConsolidation;

    @Column(name = "PREFERRED_DELIVERY_FROM")
    private LocalDateTime preferredDeliveryFrom;

    @Column(name = "PREFERRED_DELIVERY_TO")
    private LocalDateTime preferredDeliveryTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "ECO_MODE", length = 20)
    private EcoMode ecoMode = EcoMode.NONE;

    @Column(name = "ROUTING_PREFERENCES", length = 2000)
    private String routingPreferences; // JSON string for preferences

    @Column(name = "CREATED_AT", nullable = false)
    @NotNull
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    @NotNull
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CREATED_BY_USER_ID")
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ASSIGNED_DRIVER_ID")
    private User assignedDriver;

    @Column(name = "ASSIGNED_AT")
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ShipmentStatus.CREATED;
        }
        calculateVolume();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateVolume();
    }

    public void calculateVolume() {
        if (lengthCm != null && widthCm != null && heightCm != null) {
            BigDecimal volume = lengthCm.multiply(widthCm).multiply(heightCm)
                    .divide(BigDecimal.valueOf(1000000), 4, java.math.RoundingMode.HALF_UP); // Convert cm³ to m³
            this.volumeM3 = volume;
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

    public String getExternalOrderId() {
        return externalOrderId;
    }

    public void setExternalOrderId(String externalOrderId) {
        this.externalOrderId = externalOrderId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
    }

    public BigDecimal getLengthCm() {
        return lengthCm;
    }

    public void setLengthCm(BigDecimal lengthCm) {
        this.lengthCm = lengthCm;
    }

    public BigDecimal getWidthCm() {
        return widthCm;
    }

    public void setWidthCm(BigDecimal widthCm) {
        this.widthCm = widthCm;
    }

    public BigDecimal getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(BigDecimal heightCm) {
        this.heightCm = heightCm;
    }

    public BigDecimal getVolumeM3() {
        return volumeM3;
    }

    public void setVolumeM3(BigDecimal volumeM3) {
        this.volumeM3 = volumeM3;
    }

    public String getCommodityType() {
        return commodityType;
    }

    public void setCommodityType(String commodityType) {
        this.commodityType = commodityType;
    }

    public Address getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(Address pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public Address getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(Address deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public Organization getCustomer() {
        return customer;
    }

    public void setCustomer(Organization customer) {
        this.customer = customer;
    }

    public BigDecimal getDeclaredValue() {
        return declaredValue;
    }

    public void setDeclaredValue(BigDecimal declaredValue) {
        this.declaredValue = declaredValue;
    }

    public Boolean getDimsConfirmed() {
        return dimsConfirmed;
    }

    public void setDimsConfirmed(Boolean dimsConfirmed) {
        this.dimsConfirmed = dimsConfirmed;
    }

    public Boolean getConsolidationAllowed() {
        return consolidationAllowed;
    }

    public void setConsolidationAllowed(Boolean consolidationAllowed) {
        this.consolidationAllowed = consolidationAllowed;
    }

    public Integer getConsolidationPriority() {
        return consolidationPriority;
    }

    public void setConsolidationPriority(Integer consolidationPriority) {
        this.consolidationPriority = consolidationPriority;
    }

    public Consolidation getParentConsolidation() {
        return parentConsolidation;
    }

    public void setParentConsolidation(Consolidation parentConsolidation) {
        this.parentConsolidation = parentConsolidation;
    }

    public LocalDateTime getPreferredDeliveryFrom() {
        return preferredDeliveryFrom;
    }

    public void setPreferredDeliveryFrom(LocalDateTime preferredDeliveryFrom) {
        this.preferredDeliveryFrom = preferredDeliveryFrom;
    }

    public LocalDateTime getPreferredDeliveryTo() {
        return preferredDeliveryTo;
    }

    public void setPreferredDeliveryTo(LocalDateTime preferredDeliveryTo) {
        this.preferredDeliveryTo = preferredDeliveryTo;
    }

    public EcoMode getEcoMode() {
        return ecoMode;
    }

    public void setEcoMode(EcoMode ecoMode) {
        this.ecoMode = ecoMode;
    }

    public String getRoutingPreferences() {
        return routingPreferences;
    }

    public void setRoutingPreferences(String routingPreferences) {
        this.routingPreferences = routingPreferences;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public User getCreatedByUser() {
        return createdByUser;
    }

    public void setCreatedByUser(User createdByUser) {
        this.createdByUser = createdByUser;
    }

    public User getAssignedDriver() {
        return assignedDriver;
    }

    public void setAssignedDriver(User assignedDriver) {
        this.assignedDriver = assignedDriver;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
