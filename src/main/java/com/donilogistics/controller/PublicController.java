package com.donilogistics.controller;

import com.donilogistics.entity.Address;
import com.donilogistics.entity.Shipment;
import io.jmix.core.DataManager;
import io.jmix.core.Id;
import io.jmix.core.security.SystemAuthenticator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    private final DataManager dataManager;
    private final SystemAuthenticator systemAuthenticator;

    public PublicController(DataManager dataManager, SystemAuthenticator systemAuthenticator) {
        this.dataManager = dataManager;
        this.systemAuthenticator = systemAuthenticator;
    }

    @GetMapping("/shipments/track/{trackingNumber}")
    public ResponseEntity<?> getByTracking(@PathVariable("trackingNumber") String trackingNumber) {
        return systemAuthenticator.withSystem(() -> {
            List<Shipment> list = dataManager.load(Shipment.class)
                    .query("select s from Shipment s where s.trackingNumber = :tn")
                    .parameter("tn", trackingNumber)
                    .list();
            if (list.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "not found"));
            }
            Shipment s = list.get(0);
            Map<String, Object> res = new HashMap<>();
            res.put("id", s.getId());
            res.put("externalOrderId", s.getExternalOrderId());
            res.put("trackingNumber", s.getTrackingNumber());
            res.put("status", s.getStatus() != null ? s.getStatus().name() : null);
            res.put("commodityType", s.getCommodityType());
            res.put("weightKg", s.getWeightKg());
            res.put("createdAt", s.getCreatedAt());
            if (s.getCustomer() != null) {
                res.put("customer", Map.of("id", s.getCustomer().getId(), "name", s.getCustomer().getName()));
            }
            if (s.getPickupAddress() != null) res.put("pickupAddress", addressDto(s.getPickupAddress()));
            if (s.getDeliveryAddress() != null) res.put("deliveryAddress", addressDto(s.getDeliveryAddress()));
            return ResponseEntity.ok(res);
        });
    }

    private Map<String, Object> addressDto(Address a) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", a.getId());
        m.put("name", a.getName());
        m.put("contact", a.getContact());
        m.put("phone", a.getPhone());
        m.put("street", a.getStreet());
        m.put("city", a.getCity());
        m.put("state", a.getState());
        m.put("country", a.getCountry());
        m.put("postalCode", a.getPostalCode());
        m.put("latitude", a.getLatitude());
        m.put("longitude", a.getLongitude());
        return m;
    }
}
