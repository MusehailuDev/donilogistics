package com.donilogistics.entity;

public enum ConsolidationPolicy {
    AUTO_BY_WEIGHT("Auto by Weight"),
    AUTO_BY_ROUTE("Auto by Route"),
    MANUAL("Manual");

    private final String displayName;

    ConsolidationPolicy(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
