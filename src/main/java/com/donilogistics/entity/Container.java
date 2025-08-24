package com.donilogistics.entity;

import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.InstanceName;
import io.jmix.core.metamodel.annotation.JmixEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JmixEntity
@Entity
@Table(name = "CONTAINER", indexes = {
        @Index(name = "IDX_CONTAINER_NUMBER", columnList = "CONTAINER_NUMBER")
})
public class Container {

    @Id
    @Column(name = "ID")
    @JmixGeneratedValue
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @InstanceName
    @Column(name = "CONTAINER_NUMBER", nullable = false)
    private String containerNumber; // e.g., BIC code (MSCU 663987 1)

    @Column(name = "TYPE")
    private String type; // e.g., 20GP, 40HC, REEFER, etc.

    @Column(name = "STATUS")
    private String status; // AVAILABLE, IN_USE, MAINTENANCE, etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization; // owning org (internal)

    // Extra owner info (for external owners)
    @Column(name = "OWNER_NAME")
    private String ownerName;

    @Column(name = "OWNER_EMAIL")
    private String ownerEmail;

    @Column(name = "OWNER_PHONE")
    private String ownerPhone;

    @Column(name = "ASSET_TAG")
    private String assetTag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRENT_WAREHOUSE_ID")
    private Warehouse currentWarehouse;

    @Column(name = "MANUFACTURE_YEAR")
    private Integer manufactureYear;

    @Column(name = "TARE_WEIGHT_KG", precision = 19, scale = 2)
    private BigDecimal tareWeightKg;

    @Column(name = "MAX_GROSS_WEIGHT_KG", precision = 19, scale = 2)
    private BigDecimal maxGrossWeightKg;

    @Column(name = "MAX_VOLUME_M3", precision = 19, scale = 4)
    private BigDecimal maxVolumeM3;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
    public String getContainerNumber() { return containerNumber; }
    public void setContainerNumber(String containerNumber) { this.containerNumber = containerNumber; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public String getOwnerPhone() { return ownerPhone; }
    public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }
    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }
    public Warehouse getCurrentWarehouse() { return currentWarehouse; }
    public void setCurrentWarehouse(Warehouse currentWarehouse) { this.currentWarehouse = currentWarehouse; }
    public Integer getManufactureYear() { return manufactureYear; }
    public void setManufactureYear(Integer manufactureYear) { this.manufactureYear = manufactureYear; }
    public BigDecimal getTareWeightKg() { return tareWeightKg; }
    public void setTareWeightKg(BigDecimal tareWeightKg) { this.tareWeightKg = tareWeightKg; }
    public BigDecimal getMaxGrossWeightKg() { return maxGrossWeightKg; }
    public void setMaxGrossWeightKg(BigDecimal maxGrossWeightKg) { this.maxGrossWeightKg = maxGrossWeightKg; }
    public BigDecimal getMaxVolumeM3() { return maxVolumeM3; }
    public void setMaxVolumeM3(BigDecimal maxVolumeM3) { this.maxVolumeM3 = maxVolumeM3; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}


