package com.donilogistics.entity;

import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.JmixEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JmixEntity
@Table(name = "ROUTE_PLAN")
@Entity
public class RoutePlan {
    @JmixGeneratedValue
    @Column(name = "ID", nullable = false)
    @Id
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @Column(name = "NAME", length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VEHICLE_ID")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DRIVER_ID")
    private DriverProfile driver;

    @Column(name = "CAPACITY_KG", precision = 19, scale = 2)
    private BigDecimal capacityKg;

    @Column(name = "CAPACITY_VOLUME_M3", precision = 10, scale = 4)
    private BigDecimal capacityVolumeM3;

    @Column(name = "ALLOWED_LOAD_TYPES", length = 500)
    private String allowedLoadTypes; // JSON array of allowed load types

    @Column(name = "CURRENT_LATITUDE", precision = 10, scale = 6)
    private BigDecimal currentLatitude;

    @Column(name = "CURRENT_LONGITUDE", precision = 10, scale = 6)
    private BigDecimal currentLongitude;

    @Column(name = "LAST_SEEN")
    private LocalDateTime lastSeen;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROUTE_STATUS", length = 50)
    private RouteStatus routeStatus = RouteStatus.PLANNED;

    @Lob
    @Column(name = "STOPS")
    private String stops; // JSON array of ordered stops

    @Lob
    @Column(name = "ESTIMATED_TIMES")
    private String estimatedTimes; // JSON array of estimated arrival times

    @Lob
    @Column(name = "SOLVER_META")
    private String solverMeta; // JSON object with score, cost, etc.

    @Column(name = "CREATED_AT", nullable = false)
    @NotNull
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    @NotNull
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORGANIZATION_ID")
    private Organization organization;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public DriverProfile getDriver() {
        return driver;
    }

    public void setDriver(DriverProfile driver) {
        this.driver = driver;
    }

    public BigDecimal getCapacityKg() {
        return capacityKg;
    }

    public void setCapacityKg(BigDecimal capacityKg) {
        this.capacityKg = capacityKg;
    }

    public BigDecimal getCapacityVolumeM3() {
        return capacityVolumeM3;
    }

    public void setCapacityVolumeM3(BigDecimal capacityVolumeM3) {
        this.capacityVolumeM3 = capacityVolumeM3;
    }

    public String getAllowedLoadTypes() {
        return allowedLoadTypes;
    }

    public void setAllowedLoadTypes(String allowedLoadTypes) {
        this.allowedLoadTypes = allowedLoadTypes;
    }

    public BigDecimal getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(BigDecimal currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public BigDecimal getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(BigDecimal currentLongitude) {
        this.currentLongitude = currentLongitude;
    }

    public LocalDateTime getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }

    public RouteStatus getRouteStatus() {
        return routeStatus;
    }

    public void setRouteStatus(RouteStatus routeStatus) {
        this.routeStatus = routeStatus;
    }

    public String getStops() {
        return stops;
    }

    public void setStops(String stops) {
        this.stops = stops;
    }

    public String getEstimatedTimes() {
        return estimatedTimes;
    }

    public void setEstimatedTimes(String estimatedTimes) {
        this.estimatedTimes = estimatedTimes;
    }

    public String getSolverMeta() {
        return solverMeta;
    }

    public void setSolverMeta(String solverMeta) {
        this.solverMeta = solverMeta;
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
}
