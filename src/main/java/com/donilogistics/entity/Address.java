package com.donilogistics.entity;

import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.InstanceName;
import io.jmix.core.metamodel.annotation.JmixEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

@JmixEntity
@Entity
@Table(name = "ADDRESS", indexes = {
        @Index(name = "IDX_ADDRESS_ON_GEOHASH", columnList = "GEOHASH"),
        @Index(name = "IDX_ADDRESS_ON_CITY_STATE", columnList = "CITY, STATE"),
        @Index(name = "IDX_ADDRESS_ON_POSTAL_CODE", columnList = "POSTAL_CODE")
})
public class Address {

    @Id
    @Column(name = "ID")
    @JmixGeneratedValue
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @InstanceName
    @Column(name = "NAME")
    private String name;

    @Column(name = "CONTACT_PERSON")
    private String contact;

    @Column(name = "PHONE")
    private String phone;

    @Column(name = "STREET_ADDRESS", nullable = false)
    @NotNull
    private String street;

    @Column(name = "CITY", nullable = false)
    @NotNull
    private String city;

    @Column(name = "STATE")
    private String state;

    @Column(name = "COUNTRY", nullable = false)
    @NotNull
    private String country;

    @Column(name = "POSTAL_CODE")
    private String postalCode;

    @Column(name = "LATITUDE", precision = 19, scale = 6)
    private BigDecimal latitude;

    @Column(name = "LONGITUDE", precision = 19, scale = 6)
    private BigDecimal longitude;

    @Column(name = "GEOHASH", length = 12)
    private String geohash;

    @Column(name = "ADDRESS_TYPE")
    private String addressType; // pickup, delivery, warehouse, etc.

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization;

    // Getters and Setters
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
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

    public String getGeohash() {
        return geohash;
    }

    public void setGeohash(String geohash) {
        this.geohash = geohash;
    }

    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    // Helper method to get full address
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (street != null) sb.append(street);
        if (city != null) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(city);
        }
        if (state != null) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(state);
        }
        if (postalCode != null) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(postalCode);
        }
        if (country != null) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(country);
        }
        return sb.toString();
    }
}
