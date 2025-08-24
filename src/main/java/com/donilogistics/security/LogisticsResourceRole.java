package com.donilogistics.security;

import io.jmix.security.model.EntityAttributePolicyAction;
import io.jmix.security.model.EntityPolicyAction;
import io.jmix.security.role.annotation.EntityAttributePolicy;
import io.jmix.security.role.annotation.EntityPolicy;
import io.jmix.security.role.annotation.ResourceRole;

@ResourceRole(name = "Logistics Operations", code = LogisticsResourceRole.CODE, scope = "API")
public interface LogisticsResourceRole {

    String CODE = "logistics-operations";

    @EntityPolicy(entityClass = com.donilogistics.entity.Organization.class, actions = {EntityPolicyAction.READ})
    @EntityAttributePolicy(entityClass = com.donilogistics.entity.Organization.class, attributes = "*", action = EntityAttributePolicyAction.VIEW)
    void organization();

    @EntityPolicy(entityClass = com.donilogistics.entity.User.class, actions = {EntityPolicyAction.READ, EntityPolicyAction.UPDATE})
    @EntityAttributePolicy(entityClass = com.donilogistics.entity.User.class, attributes = "*", action = EntityAttributePolicyAction.MODIFY)
    void user();

    @EntityPolicy(entityClass = com.donilogistics.entity.Vehicle.class, actions = {EntityPolicyAction.ALL})
    @EntityAttributePolicy(entityClass = com.donilogistics.entity.Vehicle.class, attributes = "*", action = EntityAttributePolicyAction.MODIFY)
    void vehicle();

    @EntityPolicy(entityClass = com.donilogistics.entity.Shipment.class, actions = {EntityPolicyAction.ALL})
    @EntityAttributePolicy(entityClass = com.donilogistics.entity.Shipment.class, attributes = "*", action = EntityAttributePolicyAction.MODIFY)
    void shipment();
}
