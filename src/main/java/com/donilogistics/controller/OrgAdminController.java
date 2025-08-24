package com.donilogistics.controller;

import com.donilogistics.entity.User;
import com.donilogistics.entity.UserRole;
import com.donilogistics.entity.Organization;
import com.donilogistics.service.ConsolidationService;
import io.jmix.core.FileRef;
import io.jmix.core.FileStorage;
import io.jmix.core.FileStorageLocator;
import io.jmix.core.DataManager;
import io.jmix.core.Id;
import io.jmix.core.security.SystemAuthenticator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/org")
@CrossOrigin(origins = "*")
public class OrgAdminController {

    private static final String ORG_ADMIN_BEARER = "Bearer org-admin-token";

    private final DataManager dataManager;
    private final SystemAuthenticator systemAuthenticator;
    private final FileStorageLocator fileStorageLocator;
    private final ConsolidationService consolidationService;

    public OrgAdminController(DataManager dataManager, SystemAuthenticator systemAuthenticator, FileStorageLocator fileStorageLocator, ConsolidationService consolidationService) {
        this.dataManager = dataManager;
        this.systemAuthenticator = systemAuthenticator;
        this.fileStorageLocator = fileStorageLocator;
        this.consolidationService = consolidationService;
    }

    private Optional<User> authenticateOrgAdmin(String authHeader, String adminUserIdHeader) {
        if (authHeader == null || !authHeader.trim().equals(ORG_ADMIN_BEARER)) {
            return Optional.empty();
        }
        if (adminUserIdHeader == null || adminUserIdHeader.isBlank()) {
            return Optional.empty();
        }
        try {
            UUID adminId = UUID.fromString(adminUserIdHeader.trim());
            return systemAuthenticator.withSystem(() ->
                Optional.ofNullable(dataManager.load(User.class).id(adminId).optional().orElse(null))
            ).filter(u -> u != null && u.getUserRole() == UserRole.ORGANIZATION_ADMIN && u.getOrganization() != null);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    // ===== File upload (org-scoped, same storage as admin) =====
    @PostMapping(value = "/upload", consumes = { "multipart/form-data" })
    public ResponseEntity<?> upload(@RequestHeader(value = "Authorization", required = false) String auth,
                                    @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                    @RequestPart("file") org.springframework.web.multipart.MultipartFile file) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        try {
            FileStorage storage = fileStorageLocator.getDefault();
            FileRef ref = storage.saveStream(file.getOriginalFilename(), file.getInputStream());
            return ResponseEntity.ok(Map.of(
                    "storageName", ref.getStorageName(),
                    "fileName", ref.getFileName(),
                    "fileRef", ref.toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestHeader(value = "Authorization", required = false) String auth,
                                       @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        UUID orgId = admin.getOrganization().getId();
        return systemAuthenticator.withSystem(() -> {
            List<User> users = dataManager.load(User.class)
                    .query("select u from User u where u.organization.id = :orgId")
                    .parameter("orgId", orgId)
                    .list();
            List<Map<String, Object>> dto = users.stream().map(u -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", u.getId());
                m.put("username", u.getUsername());
                m.put("email", u.getEmail());
                m.put("active", u.getActive());
                m.put("userRole", u.getUserRole());
                if (u.getOrganization() != null) {
                    m.put("organization", Map.of("id", u.getOrganization().getId(), "name", u.getOrganization().getName()));
                }
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping("/users/{id}/activate")
    public ResponseEntity<?> activateUser(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                          @PathVariable("id") UUID userId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            User u = dataManager.load(User.class).id(userId).one();
            if (u.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(u.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            u.setActive(true);
            dataManager.save(u);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @PostMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@RequestHeader(value = "Authorization", required = false) String auth,
                                            @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                            @PathVariable("id") UUID userId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            User u = dataManager.load(User.class).id(userId).one();
            if (u.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(u.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            u.setActive(false);
            dataManager.save(u);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@RequestHeader(value = "Authorization", required = false) String auth,
                                        @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                        @PathVariable("id") UUID userId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            User u = dataManager.load(User.class).id(userId).one();
            if (u.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(u.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            dataManager.remove(Id.of(userId, User.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // ===== Organization-scoped Shipments =====
    @GetMapping("/shipments")
    public ResponseEntity<?> listShipments(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        UUID orgId = admin.getOrganization().getId();
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Shipment> shipments = dataManager.load(com.donilogistics.entity.Shipment.class)
                    .query("select s from Shipment s left join s.createdByUser cu left join cu.organization cuo where (s.customer.id = :orgId) or (cuo.id = :orgId)")
                    .parameter("orgId", orgId)
                    .list();
            List<Map<String, Object>> dto = shipments.stream().map(s -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", s.getId());
                m.put("externalOrderId", s.getExternalOrderId());
                m.put("trackingNumber", s.getTrackingNumber());
                m.put("status", s.getStatus() != null ? s.getStatus().name() : null);
                m.put("commodityType", s.getCommodityType());
                m.put("weightKg", s.getWeightKg());
                m.put("createdAt", s.getCreatedAt());
                if (s.getAssignedDriver() != null) m.put("assignedDriver", Map.of("id", s.getAssignedDriver().getId(), "username", s.getAssignedDriver().getUsername()));
                m.put("assignedAt", s.getAssignedAt());
                if (s.getCustomer() != null) m.put("customer", Map.of("id", s.getCustomer().getId(), "name", s.getCustomer().getName()));
                if (s.getPickupAddress() != null) m.put("pickupAddress", Map.of("id", s.getPickupAddress().getId(), "city", s.getPickupAddress().getCity(), "country", s.getPickupAddress().getCountry()));
                if (s.getDeliveryAddress() != null) m.put("deliveryAddress", Map.of("id", s.getDeliveryAddress().getId(), "city", s.getDeliveryAddress().getCity(), "country", s.getDeliveryAddress().getCountry()));
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    // Driver accepts a shipment (org-scoped)
    @PostMapping(value = "/shipments/{id}/accept", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> acceptShipment(@RequestHeader(value = "Authorization", required = false) String auth,
                                            @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                            @PathVariable("id") java.util.UUID shipmentId,
                                            @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Shipment s = dataManager.load(com.donilogistics.entity.Shipment.class).id(shipmentId).optional().orElse(null);
            if (s == null) return ResponseEntity.status(404).body(Map.of("error", "shipment not found"));
            if (s.getCustomer() == null || admin.getOrganization() == null || !java.util.Objects.equals(s.getCustomer().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            String driverUserIdStr = java.util.Objects.toString(body.getOrDefault("driverUserId", ""));
            if (driverUserIdStr.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "driverUserId is required"));
            try {
                User driverUser = dataManager.load(User.class).id(java.util.UUID.fromString(driverUserIdStr)).one();
                s.setAssignedDriver(driverUser);
                s.setAssignedAt(java.time.LocalDateTime.now());
                s.setStatus(com.donilogistics.entity.ShipmentStatus.READY_FOR_CONSOLIDATION);
                dataManager.save(s);
                return ResponseEntity.ok(Map.of("success", true));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        });
    }

    @PostMapping(value = "/shipments/{id}/reject", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> rejectShipment(@RequestHeader(value = "Authorization", required = false) String auth,
                                            @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                            @PathVariable("id") java.util.UUID shipmentId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Shipment s = dataManager.load(com.donilogistics.entity.Shipment.class).id(shipmentId).optional().orElse(null);
            if (s == null) return ResponseEntity.status(404).body(Map.of("error", "shipment not found"));
            if (s.getCustomer() == null || admin.getOrganization() == null || !java.util.Objects.equals(s.getCustomer().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            s.setAssignedDriver(null);
            s.setAssignedAt(null);
            s.setStatus(com.donilogistics.entity.ShipmentStatus.CREATED);
            dataManager.save(s);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // ===== Organization-scoped Drivers =====
    @GetMapping("/drivers")
    public ResponseEntity<?> listDrivers(@RequestHeader(value = "Authorization", required = false) String auth,
                                         @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        UUID orgId = admin.getOrganization().getId();
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.DriverProfile> drivers = dataManager.load(com.donilogistics.entity.DriverProfile.class)
                    .query("select d from DriverProfile d where d.organization.id = :orgId")
                    .parameter("orgId", orgId)
                    .list();
            List<Map<String, Object>> dto = drivers.stream().map(d -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", d.getId());
                m.put("user", d.getUser() != null ? Map.of("id", d.getUser().getId(), "username", d.getUser().getUsername()) : null);
                m.put("active", d.getActive());
                m.put("drivingLicenseNumber", d.getDrivingLicenseNumber());
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    // Allow org admin to update driver location within org
    @PostMapping(value = "/drivers/{id}/location", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateDriverLocation(@RequestHeader(value = "Authorization", required = false) String auth,
                                                  @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                                  @PathVariable("id") UUID driverId,
                                                  @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.DriverProfile d = dataManager.load(com.donilogistics.entity.DriverProfile.class).id(driverId).optional().orElse(null);
            if (d == null) return ResponseEntity.status(404).body(Map.of("error", "driver not found"));
            if (d.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(d.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            try {
                if (body.get("latitude") != null) d.setCurrentLatitude(new java.math.BigDecimal(Objects.toString(body.get("latitude"))));
                if (body.get("longitude") != null) d.setCurrentLongitude(new java.math.BigDecimal(Objects.toString(body.get("longitude"))));
                d.setLastSeen(java.time.LocalDateTime.now());
                dataManager.save(d);
                return ResponseEntity.ok(Map.of("success", true));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        });
    }

    // ===== Organization-scoped Vehicles =====
    @GetMapping("/vehicles")
    public ResponseEntity<?> listVehicles(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        UUID orgId = admin.getOrganization().getId();
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Vehicle> vehicles = dataManager.load(com.donilogistics.entity.Vehicle.class)
                    .query("select v from Vehicle v where v.organization.id = :orgId")
                    .parameter("orgId", orgId)
                    .list();
            List<Map<String, Object>> dto = vehicles.stream().map(v -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", v.getId());
                m.put("licensePlate", v.getLicensePlate());
                m.put("make", v.getMake());
                m.put("model", v.getModel());
                m.put("status", v.getStatus());
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping(value = "/vehicles", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createVehicle(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                           @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Vehicle v = dataManager.create(com.donilogistics.entity.Vehicle.class);
            v.setLicensePlate(Objects.toString(body.getOrDefault("licensePlate", "")).trim());
            v.setMake(Objects.toString(body.getOrDefault("make", "")));
            v.setModel(Objects.toString(body.getOrDefault("model", "")));
            if (body.get("year") != null) try { v.setYear(Integer.valueOf(body.get("year").toString())); } catch (Exception ignored) {}
            v.setVin(Objects.toString(body.getOrDefault("vin", "")));
            if (body.get("capacity") != null) try { v.setCapacity(Double.valueOf(body.get("capacity").toString())); } catch (Exception ignored) {}
            v.setCapacityUnit(Objects.toString(body.getOrDefault("capacityUnit", "kg")));
            if (body.get("volumeCapacity") != null) try { v.setVolumeCapacity(Double.valueOf(body.get("volumeCapacity").toString())); } catch (Exception ignored) {}
            v.setVolumeUnit(Objects.toString(body.getOrDefault("volumeUnit", "m3")));
            v.setFuelType(Objects.toString(body.getOrDefault("fuelType", "")));
            v.setCurrentLocation(Objects.toString(body.getOrDefault("currentLocation", "")));
            if (body.get("currentLatitude") != null) try { v.setCurrentLatitude(Double.valueOf(body.get("currentLatitude").toString())); } catch (Exception ignored) {}
            if (body.get("currentLongitude") != null) try { v.setCurrentLongitude(Double.valueOf(body.get("currentLongitude").toString())); } catch (Exception ignored) {}
            if (body.get("gpsTrackingEnabled") != null) v.setGpsTrackingEnabled(Boolean.valueOf(body.get("gpsTrackingEnabled").toString()));
            v.setOrganization(admin.getOrganization());
            String driverId = Objects.toString(body.getOrDefault("assignedDriverId", "")).trim();
            if (!driverId.isEmpty()) {
                try {
                    User d = dataManager.load(User.class).id(java.util.UUID.fromString(driverId)).one();
                    if (d.getOrganization() != null && admin.getOrganization() != null && Objects.equals(d.getOrganization().getId(), admin.getOrganization().getId())) {
                        v.setAssignedDriver(d);
                    }
                } catch (Exception ignored) {}
            }
            com.donilogistics.entity.Vehicle saved = dataManager.save(v);
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        });
    }

    @PutMapping(value = "/vehicles/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateVehicle(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                           @PathVariable("id") java.util.UUID id,
                                           @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Vehicle v = dataManager.load(com.donilogistics.entity.Vehicle.class).id(id).one();
            if (v.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(v.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            if (body.containsKey("licensePlate")) v.setLicensePlate(Objects.toString(body.get("licensePlate"), v.getLicensePlate()));
            if (body.containsKey("make")) v.setMake(Objects.toString(body.get("make"), v.getMake()));
            if (body.containsKey("model")) v.setModel(Objects.toString(body.get("model"), v.getModel()));
            if (body.containsKey("year")) try { v.setYear(Integer.valueOf(Objects.toString(body.get("year")))); } catch (Exception ignored) {}
            if (body.containsKey("vin")) v.setVin(Objects.toString(body.get("vin"), v.getVin()));
            if (body.containsKey("capacity")) try { v.setCapacity(Double.valueOf(Objects.toString(body.get("capacity")))); } catch (Exception ignored) {}
            if (body.containsKey("capacityUnit")) v.setCapacityUnit(Objects.toString(body.get("capacityUnit"), v.getCapacityUnit()));
            if (body.containsKey("volumeCapacity")) try { v.setVolumeCapacity(Double.valueOf(Objects.toString(body.get("volumeCapacity")))); } catch (Exception ignored) {}
            if (body.containsKey("volumeUnit")) v.setVolumeUnit(Objects.toString(body.get("volumeUnit"), v.getVolumeUnit()));
            if (body.containsKey("fuelType")) v.setFuelType(Objects.toString(body.get("fuelType"), v.getFuelType()));
            if (body.containsKey("currentLocation")) v.setCurrentLocation(Objects.toString(body.get("currentLocation"), v.getCurrentLocation()));
            if (body.containsKey("currentLatitude")) try { v.setCurrentLatitude(Double.valueOf(Objects.toString(body.get("currentLatitude")))); } catch (Exception ignored) {}
            if (body.containsKey("currentLongitude")) try { v.setCurrentLongitude(Double.valueOf(Objects.toString(body.get("currentLongitude")))); } catch (Exception ignored) {}
            if (body.containsKey("gpsTrackingEnabled")) v.setGpsTrackingEnabled(Boolean.valueOf(Objects.toString(body.get("gpsTrackingEnabled"))));
            if (body.containsKey("assignedDriverId")) {
                String driverId = Objects.toString(body.get("assignedDriverId"), "");
                if (driverId.isEmpty()) {
                    v.setAssignedDriver(null);
                } else {
                    try {
                        User d = dataManager.load(User.class).id(java.util.UUID.fromString(driverId)).one();
                        if (d.getOrganization() != null && admin.getOrganization() != null && Objects.equals(d.getOrganization().getId(), admin.getOrganization().getId())) {
                            v.setAssignedDriver(d);
                        }
                    } catch (Exception ignored) {}
                }
            }
            dataManager.save(v);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<?> deleteVehicle(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                           @PathVariable("id") java.util.UUID id) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Vehicle v = dataManager.load(com.donilogistics.entity.Vehicle.class).id(id).optional().orElse(null);
            if (v == null) return ResponseEntity.status(404).body(Map.of("error", "vehicle not found"));
            if (v.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(v.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            dataManager.remove(Id.of(id, com.donilogistics.entity.Vehicle.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // ===== Organization-scoped Warehouses =====
    @GetMapping("/warehouses")
    public ResponseEntity<?> listWarehouses(@RequestHeader(value = "Authorization", required = false) String auth,
                                            @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        UUID orgId = admin.getOrganization().getId();
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Warehouse> warehouses = dataManager.load(com.donilogistics.entity.Warehouse.class)
                    .query("select w from Warehouse w where w.organization.id = :orgId")
                    .parameter("orgId", orgId)
                    .list();
            List<Map<String, Object>> dto = warehouses.stream().map(w -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", w.getId());
                m.put("name", w.getName());
                m.put("code", w.getCode());
                m.put("latitude", w.getLatitude());
                m.put("longitude", w.getLongitude());
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping(value = "/warehouses", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createWarehouse(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                             @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Warehouse w = dataManager.create(com.donilogistics.entity.Warehouse.class);
            w.setName(Objects.toString(body.getOrDefault("name", "")).trim());
            w.setCode(Objects.toString(body.getOrDefault("code", "")).trim());
            if (body.get("latitude") != null) try { w.setLatitude(new java.math.BigDecimal(body.get("latitude").toString())); } catch (Exception ignored) {}
            if (body.get("longitude") != null) try { w.setLongitude(new java.math.BigDecimal(body.get("longitude").toString())); } catch (Exception ignored) {}
            w.setCity(Objects.toString(body.getOrDefault("city", "")));
            w.setCountry(Objects.toString(body.getOrDefault("country", "")));
            w.setOrganization(admin.getOrganization());
            w = dataManager.save(w);
            return ResponseEntity.ok(Map.of("id", w.getId()));
        });
    }

    @PutMapping(value = "/warehouses/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateWarehouse(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                             @PathVariable("id") java.util.UUID id,
                                             @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Warehouse w = dataManager.load(com.donilogistics.entity.Warehouse.class).id(id).one();
            if (w.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(w.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            if (body.containsKey("name")) w.setName(Objects.toString(body.get("name"), w.getName()));
            if (body.containsKey("code")) w.setCode(Objects.toString(body.get("code"), w.getCode()));
            if (body.containsKey("latitude")) try { w.setLatitude(new java.math.BigDecimal(Objects.toString(body.get("latitude")))); } catch (Exception ignored) {}
            if (body.containsKey("longitude")) try { w.setLongitude(new java.math.BigDecimal(Objects.toString(body.get("longitude")))); } catch (Exception ignored) {}
            if (body.containsKey("city")) w.setCity(Objects.toString(body.get("city"), w.getCity()));
            if (body.containsKey("country")) w.setCountry(Objects.toString(body.get("country"), w.getCountry()));
            dataManager.save(w);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/warehouses/{id}")
    public ResponseEntity<?> deleteWarehouse(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                             @PathVariable("id") java.util.UUID id) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Warehouse w = dataManager.load(com.donilogistics.entity.Warehouse.class).id(id).optional().orElse(null);
            if (w == null) return ResponseEntity.status(404).body(Map.of("error", "warehouse not found"));
            if (w.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(w.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            dataManager.remove(Id.of(id, com.donilogistics.entity.Warehouse.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // ===== Organization-scoped Containers =====
    @GetMapping("/containers")
    public ResponseEntity<?> listContainers(@RequestHeader(value = "Authorization", required = false) String auth,
                                            @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        UUID orgId = admin.getOrganization().getId();
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Container> containers = dataManager.load(com.donilogistics.entity.Container.class)
                    .query("select c from Container c where c.organization.id = :orgId")
                    .parameter("orgId", orgId)
                    .list();
            List<Map<String, Object>> dto = containers.stream().map(c -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", c.getId());
                m.put("containerNumber", c.getContainerNumber());
                m.put("type", c.getType());
                m.put("status", c.getStatus());
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping(value = "/containers", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createContainer(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                             @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Container c = dataManager.create(com.donilogistics.entity.Container.class);
            c.setContainerNumber(Objects.toString(body.getOrDefault("containerNumber", "")).trim());
            c.setType(Objects.toString(body.getOrDefault("type", "")));
            c.setStatus(Objects.toString(body.getOrDefault("status", "")));
            c.setOwnerName(Objects.toString(body.getOrDefault("ownerName", "")));
            c.setOwnerEmail(Objects.toString(body.getOrDefault("ownerEmail", "")));
            c.setOwnerPhone(Objects.toString(body.getOrDefault("ownerPhone", "")));
            c.setAssetTag(Objects.toString(body.getOrDefault("assetTag", "")));
            if (body.get("manufactureYear") != null) try { c.setManufactureYear(Integer.valueOf(Objects.toString(body.get("manufactureYear")))); } catch (Exception ignored) {}
            if (body.get("tareWeightKg") != null) try { c.setTareWeightKg(new java.math.BigDecimal(Objects.toString(body.get("tareWeightKg")))); } catch (Exception ignored) {}
            if (body.get("maxGrossWeightKg") != null) try { c.setMaxGrossWeightKg(new java.math.BigDecimal(Objects.toString(body.get("maxGrossWeightKg")))); } catch (Exception ignored) {}
            if (body.get("maxVolumeM3") != null) try { c.setMaxVolumeM3(new java.math.BigDecimal(Objects.toString(body.get("maxVolumeM3")))); } catch (Exception ignored) {}
            c.setOrganization(admin.getOrganization());
            String whId = Objects.toString(body.getOrDefault("currentWarehouseId", "")).trim();
            if (!whId.isEmpty()) {
                try {
                    com.donilogistics.entity.Warehouse w = dataManager.load(com.donilogistics.entity.Warehouse.class).id(java.util.UUID.fromString(whId)).one();
                    if (w.getOrganization() != null && admin.getOrganization() != null && Objects.equals(w.getOrganization().getId(), admin.getOrganization().getId())) {
                        c.setCurrentWarehouse(w);
                    }
                } catch (Exception ignored) {}
            }
            c = dataManager.save(c);
            return ResponseEntity.ok(Map.of("id", c.getId()));
        });
    }

    @PutMapping(value = "/containers/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateContainer(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                             @PathVariable("id") java.util.UUID id,
                                             @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Container c = dataManager.load(com.donilogistics.entity.Container.class).id(id).one();
            if (c.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(c.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            if (body.containsKey("containerNumber")) c.setContainerNumber(Objects.toString(body.get("containerNumber"), c.getContainerNumber()));
            if (body.containsKey("type")) c.setType(Objects.toString(body.get("type"), c.getType()));
            if (body.containsKey("status")) c.setStatus(Objects.toString(body.get("status"), c.getStatus()));
            if (body.containsKey("ownerName")) c.setOwnerName(Objects.toString(body.get("ownerName"), c.getOwnerName()));
            if (body.containsKey("ownerEmail")) c.setOwnerEmail(Objects.toString(body.get("ownerEmail"), c.getOwnerEmail()));
            if (body.containsKey("ownerPhone")) c.setOwnerPhone(Objects.toString(body.get("ownerPhone"), c.getOwnerPhone()));
            if (body.containsKey("assetTag")) c.setAssetTag(Objects.toString(body.get("assetTag"), c.getAssetTag()));
            if (body.containsKey("manufactureYear")) try { c.setManufactureYear(Integer.valueOf(Objects.toString(body.get("manufactureYear")))); } catch (Exception ignored) {}
            if (body.containsKey("tareWeightKg")) try { c.setTareWeightKg(new java.math.BigDecimal(Objects.toString(body.get("tareWeightKg")))); } catch (Exception ignored) {}
            if (body.containsKey("maxGrossWeightKg")) try { c.setMaxGrossWeightKg(new java.math.BigDecimal(Objects.toString(body.get("maxGrossWeightKg")))); } catch (Exception ignored) {}
            if (body.containsKey("maxVolumeM3")) try { c.setMaxVolumeM3(new java.math.BigDecimal(Objects.toString(body.get("maxVolumeM3")))); } catch (Exception ignored) {}
            if (body.containsKey("currentWarehouseId")) {
                String whId = Objects.toString(body.get("currentWarehouseId"), "").trim();
                if (whId.isEmpty()) c.setCurrentWarehouse(null);
                else {
                    try {
                        com.donilogistics.entity.Warehouse w = dataManager.load(com.donilogistics.entity.Warehouse.class).id(java.util.UUID.fromString(whId)).one();
                        if (w.getOrganization() != null && admin.getOrganization() != null && Objects.equals(w.getOrganization().getId(), admin.getOrganization().getId())) {
                            c.setCurrentWarehouse(w);
                        }
                    } catch (Exception ignored) {}
                }
            }
            dataManager.save(c);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/containers/{id}")
    public ResponseEntity<?> deleteContainer(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                             @PathVariable("id") java.util.UUID id) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Container c = dataManager.load(com.donilogistics.entity.Container.class).id(id).optional().orElse(null);
            if (c == null) return ResponseEntity.status(404).body(Map.of("error", "container not found"));
            if (c.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(c.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            dataManager.remove(Id.of(id, com.donilogistics.entity.Container.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // ===== Organization-scoped Addresses =====
    @GetMapping("/addresses")
    public ResponseEntity<?> listAddresses(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        UUID orgId = admin.getOrganization().getId();
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Address> list = dataManager.load(com.donilogistics.entity.Address.class)
                    .query("select a from Address a where a.organization.id = :orgId")
                    .parameter("orgId", orgId)
                    .list();
            List<Map<String, Object>> dto = list.stream().map(a -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", a.getId());
                m.put("name", a.getName());
                m.put("street", a.getStreet());
                m.put("city", a.getCity());
                m.put("state", a.getState());
                m.put("country", a.getCountry());
                m.put("postalCode", a.getPostalCode());
                m.put("latitude", a.getLatitude());
                m.put("longitude", a.getLongitude());
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping(value = "/addresses", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createAddress(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                           @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Address a = dataManager.create(com.donilogistics.entity.Address.class);
            a.setName(Objects.toString(body.getOrDefault("name", "")));
            a.setStreet(Objects.toString(body.getOrDefault("street", "")));
            a.setCity(Objects.toString(body.getOrDefault("city", "")));
            a.setState(Objects.toString(body.getOrDefault("state", "")));
            a.setCountry(Objects.toString(body.getOrDefault("country", "")));
            a.setPostalCode(Objects.toString(body.getOrDefault("postalCode", "")));
            if (body.get("latitude") != null) try { a.setLatitude(new java.math.BigDecimal(body.get("latitude").toString())); } catch (Exception ignored) {}
            if (body.get("longitude") != null) try { a.setLongitude(new java.math.BigDecimal(body.get("longitude").toString())); } catch (Exception ignored) {}
            a.setOrganization(admin.getOrganization());
            a = dataManager.save(a);
            return ResponseEntity.ok(Map.of("id", a.getId()));
        });
    }

    @PutMapping(value = "/addresses/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateAddress(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                           @PathVariable("id") java.util.UUID id,
                                           @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Address a = dataManager.load(com.donilogistics.entity.Address.class).id(id).one();
            Organization org = admin.getOrganization();
            if (a.getOrganization() == null || org == null || !Objects.equals(a.getOrganization().getId(), org.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            if (body.containsKey("name")) a.setName(Objects.toString(body.get("name"), a.getName()));
            if (body.containsKey("street")) a.setStreet(Objects.toString(body.get("street"), a.getStreet()));
            if (body.containsKey("city")) a.setCity(Objects.toString(body.get("city"), a.getCity()));
            if (body.containsKey("state")) a.setState(Objects.toString(body.get("state"), a.getState()));
            if (body.containsKey("country")) a.setCountry(Objects.toString(body.get("country"), a.getCountry()));
            if (body.containsKey("postalCode")) a.setPostalCode(Objects.toString(body.get("postalCode"), a.getPostalCode()));
            if (body.containsKey("latitude")) try { a.setLatitude(new java.math.BigDecimal(Objects.toString(body.get("latitude")))); } catch (Exception ignored) {}
            if (body.containsKey("longitude")) try { a.setLongitude(new java.math.BigDecimal(Objects.toString(body.get("longitude")))); } catch (Exception ignored) {}
            dataManager.save(a);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> deleteAddress(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                           @PathVariable("id") java.util.UUID id) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Address a = dataManager.load(com.donilogistics.entity.Address.class).id(id).optional().orElse(null);
            if (a == null) return ResponseEntity.status(404).body(Map.of("error", "address not found"));
            if (a.getOrganization() == null || admin.getOrganization() == null || !Objects.equals(a.getOrganization().getId(), admin.getOrganization().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
            }
            dataManager.remove(Id.of(id, com.donilogistics.entity.Address.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // ===== Organization-scoped Consolidation planning =====
    @PostMapping(value = "/consolidations/plan", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> planConsolidation(@RequestHeader(value = "Authorization", required = false) String auth,
                                               @RequestHeader(value = "X-Admin-User-Id", required = false) String adminUserId,
                                               @RequestBody Map<String, Object> body) {
        Optional<User> adminOpt = authenticateOrgAdmin(auth, adminUserId);
        if (adminOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        User admin = adminOpt.get();
        return systemAuthenticator.withSystem(() -> {
            try {
                java.util.UUID orgId = admin.getOrganization() != null ? admin.getOrganization().getId() : null;
                java.util.UUID originId = body.get("originAddressId") != null && !Objects.toString(body.get("originAddressId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("originAddressId"))) : null;
                java.util.UUID destId = body.get("destAddressId") != null && !Objects.toString(body.get("destAddressId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("destAddressId"))) : null;

                java.util.UUID originWarehouseId = body.get("originWarehouseId") != null && !Objects.toString(body.get("originWarehouseId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("originWarehouseId"))) : null;
                java.util.UUID destWarehouseId = body.get("destWarehouseId") != null && !Objects.toString(body.get("destWarehouseId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("destWarehouseId"))) : null;

                if (originId == null && originWarehouseId != null) {
                    com.donilogistics.entity.Warehouse w = dataManager.load(com.donilogistics.entity.Warehouse.class).id(originWarehouseId).one();
                    if (w.getOrganization() == null || orgId == null || !Objects.equals(w.getOrganization().getId(), orgId)) {
                        return ResponseEntity.status(403).body(Map.of("error", "origin warehouse forbidden"));
                    }
                    if (w.getLatitude() == null || w.getLongitude() == null) return ResponseEntity.badRequest().body(Map.of("error", "Origin warehouse has no lat/lon"));
                    com.donilogistics.entity.Address a = dataManager.create(com.donilogistics.entity.Address.class);
                    a.setName(((w.getCode() != null ? w.getCode() + " " : "")) + Objects.toString(w.getName(), "Warehouse"));
                    a.setCity(w.getCity()); a.setState(w.getState()); a.setCountry(w.getCountry()); a.setPostalCode(w.getPostalCode());
                    a.setLatitude(w.getLatitude()); a.setLongitude(w.getLongitude()); a.setOrganization(admin.getOrganization());
                    a = dataManager.save(a); originId = a.getId();
                }
                if (destId == null && destWarehouseId != null) {
                    com.donilogistics.entity.Warehouse w = dataManager.load(com.donilogistics.entity.Warehouse.class).id(destWarehouseId).one();
                    if (w.getOrganization() == null || orgId == null || !Objects.equals(w.getOrganization().getId(), orgId)) {
                        return ResponseEntity.status(403).body(Map.of("error", "destination warehouse forbidden"));
                    }
                    if (w.getLatitude() == null || w.getLongitude() == null) return ResponseEntity.badRequest().body(Map.of("error", "Destination warehouse has no lat/lon"));
                    com.donilogistics.entity.Address a = dataManager.create(com.donilogistics.entity.Address.class);
                    a.setName(((w.getCode() != null ? w.getCode() + " " : "")) + Objects.toString(w.getName(), "Warehouse"));
                    a.setCity(w.getCity()); a.setState(w.getState()); a.setCountry(w.getCountry()); a.setPostalCode(w.getPostalCode());
                    a.setLatitude(w.getLatitude()); a.setLongitude(w.getLongitude()); a.setOrganization(admin.getOrganization());
                    a = dataManager.save(a); destId = a.getId();
                }

                java.util.List<String> sids = (java.util.List<String>) body.getOrDefault("shipmentIds", java.util.Collections.emptyList());
                java.util.List<java.util.UUID> shipmentIds = new java.util.ArrayList<>();
                for (String s : sids) {
                    try { shipmentIds.add(java.util.UUID.fromString(s)); } catch (Exception ignored) {}
                }
                // Validate shipments belong to org
                for (java.util.UUID sid : shipmentIds) {
                    var sh = dataManager.load(com.donilogistics.entity.Shipment.class).id(sid).optional().orElse(null);
                    if (sh == null) return ResponseEntity.badRequest().body(Map.of("error", "invalid shipmentId: " + sid));
                    java.util.UUID custId = sh.getCustomer() != null ? sh.getCustomer().getId() : null;
                    if (custId == null || orgId == null || !Objects.equals(custId, orgId)) {
                        return ResponseEntity.status(403).body(Map.of("error", "shipment not in your organization: " + sid));
                    }
                }

                java.util.UUID routePlanId = consolidationService.createConsolidationAndPlanRoute(originId, destId, shipmentIds, null, null, orgId);
                return ResponseEntity.ok(Map.of("routePlanId", routePlanId));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        });
    }
}


