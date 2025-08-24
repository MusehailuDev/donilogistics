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
@Table(name = "WAREHOUSE", indexes = {
        @Index(name = "IDX_WAREHOUSE_ON_CODE", columnList = "CODE", unique = true),
        @Index(name = "IDX_WAREHOUSE_ON_CITY", columnList = "CITY"),
        @Index(name = "IDX_WAREHOUSE_ON_ORGANIZATION", columnList = "ORGANIZATION_ID")
})
public class Warehouse {

    @Id
    @Column(name = "ID")
    @JmixGeneratedValue
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @InstanceName
    @Column(name = "NAME", nullable = false)
    private String name;

    @Column(name = "CODE", length = 50)
    private String code;

    @Column(name = "LATITUDE", precision = 19, scale = 6)
    private BigDecimal latitude;

    @Column(name = "LONGITUDE", precision = 19, scale = 6)
    private BigDecimal longitude;

    @Column(name = "ADDRESS_LINE1")
    private String addressLine1;

    @Column(name = "ADDRESS_LINE2")
    private String addressLine2;

    @Column(name = "CITY")
    private String city;

    @Column(name = "STATE")
    private String state;

    @Column(name = "COUNTRY", length = 10)
    private String country;

    @Column(name = "POSTAL_CODE")
    private String postalCode;

    @Column(name = "CAPACITY_WEIGHT_KG", precision = 19, scale = 2)
    private BigDecimal capacityWeightKg;

    @Column(name = "CAPACITY_VOLUME_M3", precision = 19, scale = 4)
    private BigDecimal capacityVolumeM3;

    @Column(name = "OPERATING_HOURS", length = 1000)
    private String operatingHours;

    @Column(name = "ACTIVE")
    private Boolean isActive = Boolean.TRUE;

    @Column(name = "CONTACT_NAME")
    private String contactName;

    @Column(name = "CONTACT_PHONE")
    private String contactPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MANAGER_USER_ID")
    private User manager; // warehouse manager user

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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public BigDecimal getCapacityWeightKg() { return capacityWeightKg; }
    public void setCapacityWeightKg(BigDecimal capacityWeightKg) { this.capacityWeightKg = capacityWeightKg; }
    public BigDecimal getCapacityVolumeM3() { return capacityVolumeM3; }
    public void setCapacityVolumeM3(BigDecimal capacityVolumeM3) { this.capacityVolumeM3 = capacityVolumeM3; }
    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}


