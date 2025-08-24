package com.donilogistics.entity;

import io.jmix.core.FileRef;
import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.InstanceName;
import io.jmix.core.metamodel.annotation.JmixEntity;
import io.jmix.core.metamodel.annotation.PropertyDatatype;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@JmixEntity
@Entity
@Table(name = "VEHICLE", indexes = {
        @Index(name = "IDX_VEHICLE_ON_LICENSE_PLATE", columnList = "LICENSE_PLATE", unique = true),
        @Index(name = "IDX_VEHICLE_ON_ORGANIZATION", columnList = "ORGANIZATION_ID")
})
public class Vehicle {

    @Id
    @Column(name = "ID")
    @JmixGeneratedValue
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @InstanceName
    @Column(name = "LICENSE_PLATE", nullable = false)
    @NotNull
    private String licensePlate;

    @Column(name = "MAKE")
    private String make;

    @Column(name = "MODEL")
    private String model;

    @Column(name = "YEAR")
    private Integer year;

    @Column(name = "VIN")
    private String vin;

    @Column(name = "CAPACITY")
    private Double capacity;

    @Column(name = "CAPACITY_UNIT")
    private String capacityUnit;

    @Column(name = "VOLUME_CAPACITY")
    private Double volumeCapacity;

    @Column(name = "VOLUME_UNIT")
    private String volumeUnit;

    @Column(name = "FUEL_TYPE")
    private String fuelType;

    @Column(name = "REGISTRATION_EXPIRY")
    private LocalDate registrationExpiry;

    @Column(name = "INSURANCE_EXPIRY")
    private LocalDate insuranceExpiry;

    @Column(name = "MAINTENANCE_DUE_DATE")
    private LocalDate maintenanceDueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ASSIGNED_DRIVER_ID")
    private User assignedDriver;

    @Column(name = "CURRENT_LOCATION")
    private String currentLocation;

    @Column(name = "CURRENT_LATITUDE")
    private Double currentLatitude;

    @Column(name = "CURRENT_LONGITUDE")
    private Double currentLongitude;

    @Column(name = "GPS_TRACKING_ENABLED")
    private Boolean gpsTrackingEnabled = false;

    @Column(name = "NOTES")
    private String notes;

    @PropertyDatatype("fileRef")
    @Column(name = "REGISTRATION_DOCUMENT")
    private FileRef registrationDocument;

    @PropertyDatatype("fileRef")
    @Column(name = "INSURANCE_DOCUMENT")
    private FileRef insuranceDocument;

    @PropertyDatatype("fileRef")
    @Column(name = "VEHICLE_PHOTO")
    private FileRef photo;

    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "LAST_MODIFIED_DATE")
    private LocalDateTime lastModifiedDate;

    @Column(name = "LAST_MODIFIED_BY")
    private String lastModifiedBy;

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

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public Double getCapacity() {
        return capacity;
    }

    public void setCapacity(Double capacity) {
        this.capacity = capacity;
    }

    public String getCapacityUnit() {
        return capacityUnit;
    }

    public void setCapacityUnit(String capacityUnit) {
        this.capacityUnit = capacityUnit;
    }

    public Double getVolumeCapacity() {
        return volumeCapacity;
    }

    public void setVolumeCapacity(Double volumeCapacity) {
        this.volumeCapacity = volumeCapacity;
    }

    public String getVolumeUnit() {
        return volumeUnit;
    }

    public void setVolumeUnit(String volumeUnit) {
        this.volumeUnit = volumeUnit;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public LocalDate getRegistrationExpiry() {
        return registrationExpiry;
    }

    public void setRegistrationExpiry(LocalDate registrationExpiry) {
        this.registrationExpiry = registrationExpiry;
    }

    public LocalDate getInsuranceExpiry() {
        return insuranceExpiry;
    }

    public void setInsuranceExpiry(LocalDate insuranceExpiry) {
        this.insuranceExpiry = insuranceExpiry;
    }

    public LocalDate getMaintenanceDueDate() {
        return maintenanceDueDate;
    }

    public void setMaintenanceDueDate(LocalDate maintenanceDueDate) {
        this.maintenanceDueDate = maintenanceDueDate;
    }

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public User getAssignedDriver() {
        return assignedDriver;
    }

    public void setAssignedDriver(User assignedDriver) {
        this.assignedDriver = assignedDriver;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }

    public Double getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(Double currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public Double getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(Double currentLongitude) {
        this.currentLongitude = currentLongitude;
    }

    public Boolean getGpsTrackingEnabled() {
        return gpsTrackingEnabled;
    }

    public void setGpsTrackingEnabled(Boolean gpsTrackingEnabled) {
        this.gpsTrackingEnabled = gpsTrackingEnabled;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public FileRef getRegistrationDocument() {
        return registrationDocument;
    }

    public void setRegistrationDocument(FileRef registrationDocument) {
        this.registrationDocument = registrationDocument;
    }

    public FileRef getInsuranceDocument() {
        return insuranceDocument;
    }

    public void setInsuranceDocument(FileRef insuranceDocument) {
        this.insuranceDocument = insuranceDocument;
    }

    public FileRef getPhoto() {
        return photo;
    }

    public void setPhoto(FileRef photo) {
        this.photo = photo;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(LocalDateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }
}
