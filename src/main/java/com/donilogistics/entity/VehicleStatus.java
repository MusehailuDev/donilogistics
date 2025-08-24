package com.donilogistics.entity;

public enum VehicleStatus {
    AVAILABLE("Available"),
    IN_TRANSIT("In Transit"),
    MAINTENANCE("Under Maintenance"),
    OUT_OF_SERVICE("Out of Service"),
    RESERVED("Reserved");

    private final String displayName;

    VehicleStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
