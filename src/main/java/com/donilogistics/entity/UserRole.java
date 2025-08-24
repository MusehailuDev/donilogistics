package com.donilogistics.entity;

public enum UserRole {
    SUPER_ADMIN("Super Administrator"),
    ORGANIZATION_ADMIN("Organization Administrator"),
    DISPATCHER("Dispatcher/Fleet Manager"),
    DRIVER("Driver"),
    WAREHOUSE_MANAGER("Warehouse Manager"),
    FACILITATOR("Facilitator"),
    CUSTOMER_SERVICE("Customer Service"),
    ACCOUNTANT("Accountant"),
    OPERATIONS_MANAGER("Operations Manager"),
    CUSTOMER("Customer/User");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
