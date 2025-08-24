package com.donilogistics.entity;

import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.JmixEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

@JmixEntity
@Table(name = "PROOF_OF_DELIVERY")
@Entity
public class ProofOfDelivery {
    @JmixGeneratedValue
    @Column(name = "ID", nullable = false)
    @Id
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "SHIPMENT_ID", nullable = false)
    private Shipment shipment;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "POD_TYPE", nullable = false, length = 50)
    private PodType podType;

    @Column(name = "POD_FILES", length = 2000)
    private String podFiles; // JSON array of file references

    @Column(name = "SIGNED_BY", length = 255)
    private String signedBy;

    @Column(name = "SIGNED_AT")
    private LocalDateTime signedAt;

    @Column(name = "NOTES", length = 1000)
    private String notes;

    @Column(name = "POD_VERIFIED")
    private Boolean podVerified = false;

    @Column(name = "VERIFICATION_METHOD", length = 100)
    private String verificationMethod;

    @Column(name = "VERIFIED_AT")
    private LocalDateTime verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VERIFIED_BY_USER_ID")
    private User verifiedByUser;

    @Column(name = "CREATED_AT", nullable = false)
    @NotNull
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
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

    public PodType getPodType() {
        return podType;
    }

    public void setPodType(PodType podType) {
        this.podType = podType;
    }

    public String getPodFiles() {
        return podFiles;
    }

    public void setPodFiles(String podFiles) {
        this.podFiles = podFiles;
    }

    public String getSignedBy() {
        return signedBy;
    }

    public void setSignedBy(String signedBy) {
        this.signedBy = signedBy;
    }

    public LocalDateTime getSignedAt() {
        return signedAt;
    }

    public void setSignedAt(LocalDateTime signedAt) {
        this.signedAt = signedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getPodVerified() {
        return podVerified;
    }

    public void setPodVerified(Boolean podVerified) {
        this.podVerified = podVerified;
    }

    public String getVerificationMethod() {
        return verificationMethod;
    }

    public void setVerificationMethod(String verificationMethod) {
        this.verificationMethod = verificationMethod;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public User getVerifiedByUser() {
        return verifiedByUser;
    }

    public void setVerifiedByUser(User verifiedByUser) {
        this.verifiedByUser = verifiedByUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }
}
