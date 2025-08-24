package com.donilogistics.entity;

public enum ShipmentPriority {
    LOW("Low"),
    NORMAL("Normal"),
    HIGH("High"),
    URGENT("Urgent"),
    EXPRESS("Express");

    private final String displayName;

    ShipmentPriority(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
