package com.donilogistics.entity;

import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.JmixEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JmixEntity
@Entity
@Table(name = "CONSOLIDATION", indexes = {
        @Index(name = "IDX_CONSOLIDATION_ON_STATUS", columnList = "STATUS"),
        @Index(name = "IDX_CONSOLIDATION_ON_ORIGIN_WAREHOUSE", columnList = "ORIGIN_WAREHOUSE_ID"),
        @Index(name = "IDX_CONSOLIDATION_ON_DEST_WAREHOUSE", columnList = "DEST_WAREHOUSE_ID"),
        @Index(name = "IDX_CONSOLIDATION_ON_CREATED_AT", columnList = "CREATED_AT")
})
public class Consolidation {

    @Id
    @Column(name = "ID")
    @JmixGeneratedValue
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false)
    @NotNull
    private ConsolidationStatus status = ConsolidationStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORIGIN_WAREHOUSE_ID")
    private Address originWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEST_WAREHOUSE_ID")
    private Address destWarehouse;

    @Column(name = "PLANNED_DEPARTURE_TIME")
    private LocalDateTime plannedDepartureTime;

    @Column(name = "PLANNED_ARRIVAL_TIME")
    private LocalDateTime plannedArrivalTime;

    @Column(name = "AGGREGATED_WEIGHT", precision = 19, scale = 2)
    private BigDecimal aggregatedWeight;

    @Column(name = "AGGREGATED_VOLUME", precision = 19, scale = 4)
    private BigDecimal aggregatedVolume;

    @Enumerated(EnumType.STRING)
    @Column(name = "CONSOLIDATION_POLICY")
    private ConsolidationPolicy consolidationPolicy = ConsolidationPolicy.AUTO_BY_WEIGHT;

    @Column(name = "ECO_MODE_APPLIED")
    private Boolean ecoModeApplied = false;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "SEALED_AT")
    private LocalDateTime sealedAt;

    @Column(name = "DISPATCHED_AT")
    private LocalDateTime dispatchedAt;

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

    public ConsolidationStatus getStatus() {
        return status;
    }

    public void setStatus(ConsolidationStatus status) {
        this.status = status;
    }

    public Address getOriginWarehouse() {
        return originWarehouse;
    }

    public void setOriginWarehouse(Address originWarehouse) {
        this.originWarehouse = originWarehouse;
    }

    public Address getDestWarehouse() {
        return destWarehouse;
    }

    public void setDestWarehouse(Address destWarehouse) {
        this.destWarehouse = destWarehouse;
    }

    public LocalDateTime getPlannedDepartureTime() {
        return plannedDepartureTime;
    }

    public void setPlannedDepartureTime(LocalDateTime plannedDepartureTime) {
        this.plannedDepartureTime = plannedDepartureTime;
    }

    public LocalDateTime getPlannedArrivalTime() {
        return plannedArrivalTime;
    }

    public void setPlannedArrivalTime(LocalDateTime plannedArrivalTime) {
        this.plannedArrivalTime = plannedArrivalTime;
    }

    public BigDecimal getAggregatedWeight() {
        return aggregatedWeight;
    }

    public void setAggregatedWeight(BigDecimal aggregatedWeight) {
        this.aggregatedWeight = aggregatedWeight;
    }

    public BigDecimal getAggregatedVolume() {
        return aggregatedVolume;
    }

    public void setAggregatedVolume(BigDecimal aggregatedVolume) {
        this.aggregatedVolume = aggregatedVolume;
    }

    public ConsolidationPolicy getConsolidationPolicy() {
        return consolidationPolicy;
    }

    public void setConsolidationPolicy(ConsolidationPolicy consolidationPolicy) {
        this.consolidationPolicy = consolidationPolicy;
    }

    public Boolean getEcoModeApplied() {
        return ecoModeApplied;
    }

    public void setEcoModeApplied(Boolean ecoModeApplied) {
        this.ecoModeApplied = ecoModeApplied;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getSealedAt() {
        return sealedAt;
    }

    public void setSealedAt(LocalDateTime sealedAt) {
        this.sealedAt = sealedAt;
    }

    public LocalDateTime getDispatchedAt() {
        return dispatchedAt;
    }

    public void setDispatchedAt(LocalDateTime dispatchedAt) {
        this.dispatchedAt = dispatchedAt;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }
}
