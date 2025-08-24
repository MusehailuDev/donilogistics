package com.donilogistics.entity;

import io.jmix.core.metamodel.datatype.EnumClass;

public enum ShipmentStatus implements EnumClass<String> {
    CREATED("Created"),
    READY_FOR_CONSOLIDATION("Ready for Consolidation"),
    CONSOLIDATED("Consolidated"),
    IN_TRANSIT("In Transit"),
    OUT_FOR_DELIVERY("Out for Delivery"),
    DELIVERED("Delivered"),
    RETURNED("Returned"),
    CANCELLED("Cancelled");

    private final String displayName;

    ShipmentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Jmix EnumClass implementation (use enum name as id)
    @Override
    public String getId() {
        return name();
    }

    public static ShipmentStatus fromId(String id) {
        if (id == null) return null;
        try { return ShipmentStatus.valueOf(id); } catch (IllegalArgumentException e) { return null; }
    }
}
