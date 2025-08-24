package com.donilogistics.security;

import io.jmix.security.model.EntityAttributePolicyAction;
import io.jmix.security.model.EntityPolicyAction;
import io.jmix.security.role.annotation.EntityAttributePolicy;
import io.jmix.security.role.annotation.EntityPolicy;
import io.jmix.security.role.annotation.ResourceRole;
import io.jmix.security.role.annotation.SpecificPolicy;

@ResourceRole(name = "Anonymous REST Role", code = AnonymousRestRole.CODE, scope = "API")
public interface AnonymousRestRole {

    String CODE = "anonymous-rest-role";

    @EntityPolicy(entityClass = com.donilogistics.entity.Organization.class, actions = {EntityPolicyAction.READ})
    @EntityAttributePolicy(entityClass = com.donilogistics.entity.Organization.class, attributes = "*", action = EntityAttributePolicyAction.VIEW)
    void organization();

    @SpecificPolicy(resources = "rest.enabled")
    void restAccess();
}


