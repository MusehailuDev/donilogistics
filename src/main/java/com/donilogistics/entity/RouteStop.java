package com.donilogistics.entity;

import io.jmix.core.entity.annotation.JmixGeneratedValue;
import io.jmix.core.metamodel.annotation.JmixEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@JmixEntity
@Entity
@Table(name = "ROUTE_STOP")
public class RouteStop {

    @Id
    @Column(name = "ID")
    @JmixGeneratedValue
    private UUID id;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Integer version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROUTE_PLAN_ID")
    private RoutePlan routePlan;

    @Column(name = "SEQUENCE_NO")
    private Integer sequenceNo;

    @Column(name = "LAT", precision = 10, scale = 6)
    private BigDecimal lat;

    @Column(name = "LON", precision = 10, scale = 6)
    private BigDecimal lon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SHIPMENT_ID")
    private Shipment shipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WAREHOUSE_ID")
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(name = "STOP_TYPE", length = 20)
    private RouteStopType stopType;

    public RouteStopType getStopType() {
        return stopType;
    }

    public void setStopType(RouteStopType stopType) {
        this.stopType = stopType;
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

    public RoutePlan getRoutePlan() {
        return routePlan;
    }

    public void setRoutePlan(RoutePlan routePlan) {
        this.routePlan = routePlan;
    }

    public Integer getSequenceNo() {
        return sequenceNo;
    }

    public void setSequenceNo(Integer sequenceNo) {
        this.sequenceNo = sequenceNo;
    }

    public BigDecimal getLat() {
        return lat;
    }

    public void setLat(BigDecimal lat) {
        this.lat = lat;
    }

    public BigDecimal getLon() {
        return lon;
    }

    public void setLon(BigDecimal lon) {
        this.lon = lon;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public void setShipment(Shipment shipment) {
        this.shipment = shipment;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }
}


