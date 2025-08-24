package com.donilogistics.entity;

public enum EcoMode {
    NONE("None"),
    ECO("Eco"),
    EXPRESS("Express");

    private final String displayName;

    EcoMode(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
