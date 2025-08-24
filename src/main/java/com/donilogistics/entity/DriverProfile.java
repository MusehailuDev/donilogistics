package com.donilogistics.entity;

import io.jmix.core.FileRef;
import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.JmixEntity;
import io.jmix.core.metamodel.annotation.PropertyDatatype;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@JmixEntity
@Entity
@Table(name = "DRIVER_PROFILE", indexes = {
        @Index(name = "IDX_DRIVER_PROFILE_ON_USER", columnList = "USER_ID", unique = true),
        @Index(name = "IDX_DRIVER_PROFILE_ON_ORGANIZATION", columnList = "ORGANIZATION_ID")
})
public class DriverProfile {

    @Id
    @Column(name = "ID")
    @JmixGeneratedValue
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization;

    @Column(name = "BLOOD_TYPE")
    private String bloodType;

    @Column(name = "DRIVING_LICENSE_NUMBER")
    private String drivingLicenseNumber;

    @Column(name = "AGE")
    private Integer age;

    @Column(name = "HIRED_DATE")
    private LocalDate hiredDate;

    @Column(name = "DL_ISSUE_DATE")
    private LocalDate drivingLicenseIssueDate;

    @Column(name = "DL_EXPIRY_DATE")
    private LocalDate drivingLicenseExpiryDate;

    @PropertyDatatype("fileRef")
    @Column(name = "DL_DOCUMENT")
    private FileRef drivingLicenseDocument;

    @PropertyDatatype("fileRef")
    @Column(name = "ID_DOCUMENT")
    private FileRef idDocument;

    @Column(name = "NOTES")
    private String notes;

    @Column(name = "ACTIVE")
    private Boolean active = true;

    @Column(name = "CURRENT_LATITUDE", precision = 10, scale = 6)
    private java.math.BigDecimal currentLatitude;

    @Column(name = "CURRENT_LONGITUDE", precision = 10, scale = 6)
    private java.math.BigDecimal currentLongitude;

    @Column(name = "LAST_SEEN")
    private LocalDateTime lastSeen;

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public String getDrivingLicenseNumber() {
        return drivingLicenseNumber;
    }

    public void setDrivingLicenseNumber(String drivingLicenseNumber) {
        this.drivingLicenseNumber = drivingLicenseNumber;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public LocalDate getHiredDate() {
        return hiredDate;
    }

    public void setHiredDate(LocalDate hiredDate) {
        this.hiredDate = hiredDate;
    }

    public LocalDate getDrivingLicenseIssueDate() {
        return drivingLicenseIssueDate;
    }

    public void setDrivingLicenseIssueDate(LocalDate drivingLicenseIssueDate) {
        this.drivingLicenseIssueDate = drivingLicenseIssueDate;
    }

    public LocalDate getDrivingLicenseExpiryDate() {
        return drivingLicenseExpiryDate;
    }

    public void setDrivingLicenseExpiryDate(LocalDate drivingLicenseExpiryDate) {
        this.drivingLicenseExpiryDate = drivingLicenseExpiryDate;
    }

    public FileRef getDrivingLicenseDocument() {
        return drivingLicenseDocument;
    }

    public void setDrivingLicenseDocument(FileRef drivingLicenseDocument) {
        this.drivingLicenseDocument = drivingLicenseDocument;
    }

    public FileRef getIdDocument() {
        return idDocument;
    }

    public void setIdDocument(FileRef idDocument) {
        this.idDocument = idDocument;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public java.math.BigDecimal getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(java.math.BigDecimal currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public java.math.BigDecimal getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(java.math.BigDecimal currentLongitude) {
        this.currentLongitude = currentLongitude;
    }

    public LocalDateTime getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
}


