package com.donilogistics.service;

import com.donilogistics.entity.Shipment;
import com.donilogistics.entity.ShipmentStatus;
import com.donilogistics.entity.User;
import com.donilogistics.entity.Vehicle;
import io.jmix.core.DataManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service("doni_LogisticsService")
public class LogisticsService {

    @Autowired
    private DataManager dataManager;

    @Transactional
    public Shipment createShipment(Shipment shipmentData) {
        // Set initial status
        shipmentData.setStatus(ShipmentStatus.CREATED);
        
        // Set timestamps
        shipmentData.setCreatedAt(java.time.LocalDateTime.now());
        shipmentData.setUpdatedAt(java.time.LocalDateTime.now());
        
        return dataManager.save(shipmentData);
    }

    @Transactional
    public boolean updateShipmentStatus(UUID shipmentId, ShipmentStatus status) {
        Shipment shipment = dataManager.load(Shipment.class)
                .id(shipmentId)
                .optional()
                .orElse(null);

        if (shipment == null) {
            return false;
        }

        shipment.setStatus(status);
        shipment.setUpdatedAt(java.time.LocalDateTime.now());
        dataManager.save(shipment);
        return true;
    }
}
