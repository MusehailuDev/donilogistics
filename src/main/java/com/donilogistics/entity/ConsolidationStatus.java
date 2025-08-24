package com.donilogistics.entity;

public enum ConsolidationStatus {
    OPEN("Open"),
    SEALED("Sealed"),
    DISPATCHED("Dispatched"),
    RECEIVED_AT_WAREHOUSE("Received at Warehouse"),
    MERGED("Merged"),
    CANCELLED("Cancelled");

    private final String displayName;

    ConsolidationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
