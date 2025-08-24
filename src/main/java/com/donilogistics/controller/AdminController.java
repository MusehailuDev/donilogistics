package com.donilogistics.controller;

import com.donilogistics.entity.Organization;
import com.donilogistics.entity.Vehicle;
import com.donilogistics.entity.VehicleStatus;
import com.donilogistics.entity.User;
import com.donilogistics.entity.UserRole;
import com.donilogistics.entity.DriverProfile;
import io.jmix.core.DataManager;
import io.jmix.core.FileRef;
import io.jmix.core.FileStorage;
import io.jmix.core.FileStorageLocator;
import io.jmix.core.Id;
import io.jmix.core.security.SystemAuthenticator;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.donilogistics.entity.NotificationChannel;
import com.donilogistics.entity.NotificationType;
import com.donilogistics.service.NotificationService;
import com.donilogistics.service.ConsolidationService;
import com.donilogistics.service.GraphHopperService;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private static final String DEV_ADMIN_BEARER = "Bearer dev-admin-token";
    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final DataManager dataManager;
    private final SystemAuthenticator systemAuthenticator;
    private final FileStorageLocator fileStorageLocator;

    private final NotificationService notificationService;
    private final ConsolidationService consolidationService;
    private final PasswordEncoder passwordEncoder;
    private final GraphHopperService graphHopperService;

    public AdminController(DataManager dataManager, SystemAuthenticator systemAuthenticator, FileStorageLocator fileStorageLocator, NotificationService notificationService, ConsolidationService consolidationService, PasswordEncoder passwordEncoder, GraphHopperService graphHopperService) {
        this.dataManager = dataManager;
        this.systemAuthenticator = systemAuthenticator;
        this.fileStorageLocator = fileStorageLocator;
        this.notificationService = notificationService;
        this.consolidationService = consolidationService;
        this.passwordEncoder = passwordEncoder;
        this.graphHopperService = graphHopperService;
    }

    @PersistenceContext
    private EntityManager entityManager;

    private boolean isDevAdmin(String authHeader) {
        return authHeader != null && authHeader.trim().equals(DEV_ADMIN_BEARER);
    }

    // ===== Warehouses =====
    @GetMapping("/warehouses")
    public ResponseEntity<?> listWarehouses(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Warehouse> warehouses = dataManager.load(com.donilogistics.entity.Warehouse.class).all().list();
            List<Map<String, Object>> dto = warehouses.stream().map(w -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", w.getId());
                m.put("name", w.getName());
                m.put("code", w.getCode());
                m.put("latitude", w.getLatitude());
                m.put("longitude", w.getLongitude());
                m.put("addressLine1", w.getAddressLine1());
                m.put("addressLine2", w.getAddressLine2());
                m.put("city", w.getCity());
                m.put("state", w.getState());
                m.put("country", w.getCountry());
                m.put("postalCode", w.getPostalCode());
                m.put("capacityWeightKg", w.getCapacityWeightKg());
                m.put("capacityVolumeM3", w.getCapacityVolumeM3());
                m.put("operatingHours", w.getOperatingHours());
                m.put("isActive", w.getIsActive());
                m.put("contactName", w.getContactName());
                m.put("contactPhone", w.getContactPhone());
                if (w.getOrganization() != null) m.put("organization", Map.of("id", w.getOrganization().getId(), "name", w.getOrganization().getName()));
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping(value = "/warehouses", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createWarehouse(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Warehouse w = dataManager.create(com.donilogistics.entity.Warehouse.class);
            w.setName(Objects.toString(body.getOrDefault("name", "")).trim());
            w.setCode(Objects.toString(body.getOrDefault("code", "")).trim());
            if (body.get("latitude") != null) try { w.setLatitude(new java.math.BigDecimal(body.get("latitude").toString())); } catch (Exception ignored) {}
            if (body.get("longitude") != null) try { w.setLongitude(new java.math.BigDecimal(body.get("longitude").toString())); } catch (Exception ignored) {}
            w.setAddressLine1(Objects.toString(body.getOrDefault("addressLine1", "")));
            w.setAddressLine2(Objects.toString(body.getOrDefault("addressLine2", "")));
            w.setCity(Objects.toString(body.getOrDefault("city", "")));
            w.setState(Objects.toString(body.getOrDefault("state", "")));
            w.setCountry(Objects.toString(body.getOrDefault("country", "")));
            w.setPostalCode(Objects.toString(body.getOrDefault("postalCode", "")));
            if (body.get("capacityWeightKg") != null) try { w.setCapacityWeightKg(new java.math.BigDecimal(body.get("capacityWeightKg").toString())); } catch (Exception ignored) {}
            if (body.get("capacityVolumeM3") != null) try { w.setCapacityVolumeM3(new java.math.BigDecimal(body.get("capacityVolumeM3").toString())); } catch (Exception ignored) {}
            w.setOperatingHours(Objects.toString(body.getOrDefault("operatingHours", "")));
            if (body.get("isActive") != null) w.setIsActive(Boolean.valueOf(body.get("isActive").toString()));
            w.setContactName(Objects.toString(body.getOrDefault("contactName", "")));
            w.setContactPhone(Objects.toString(body.getOrDefault("contactPhone", "")));
            String orgId = Objects.toString(body.getOrDefault("organizationId", "")).trim();
            if (!orgId.isEmpty()) {
                try {
                    Organization org = dataManager.load(Organization.class).id(java.util.UUID.fromString(orgId)).one();
                    w.setOrganization(org);
                } catch (Exception ignored) {}
            }
            String managerId = Objects.toString(body.getOrDefault("managerUserId", "")).trim();
            if (!managerId.isEmpty()) {
                try {
                    User manager = dataManager.load(User.class).id(java.util.UUID.fromString(managerId)).one();
                    w.setManager(manager);
                } catch (Exception ignored) {}
            }
            com.donilogistics.entity.Warehouse saved = dataManager.save(w);
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        });
    }

    @PutMapping(value = "/warehouses/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateWarehouse(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @PathVariable("id") UUID id,
                                             @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Warehouse w = dataManager.load(com.donilogistics.entity.Warehouse.class).id(id).one();
            if (body.containsKey("name")) w.setName(Objects.toString(body.get("name"), w.getName()));
            if (body.containsKey("code")) w.setCode(Objects.toString(body.get("code"), w.getCode()));
            if (body.containsKey("latitude")) try { w.setLatitude(new java.math.BigDecimal(Objects.toString(body.get("latitude")))); } catch (Exception ignored) {}
            if (body.containsKey("longitude")) try { w.setLongitude(new java.math.BigDecimal(Objects.toString(body.get("longitude")))); } catch (Exception ignored) {}
            if (body.containsKey("addressLine1")) w.setAddressLine1(Objects.toString(body.get("addressLine1"), w.getAddressLine1()));
            if (body.containsKey("addressLine2")) w.setAddressLine2(Objects.toString(body.get("addressLine2"), w.getAddressLine2()));
            if (body.containsKey("city")) w.setCity(Objects.toString(body.get("city"), w.getCity()));
            if (body.containsKey("state")) w.setState(Objects.toString(body.get("state"), w.getState()));
            if (body.containsKey("country")) w.setCountry(Objects.toString(body.get("country"), w.getCountry()));
            if (body.containsKey("postalCode")) w.setPostalCode(Objects.toString(body.get("postalCode"), w.getPostalCode()));
            if (body.containsKey("capacityWeightKg")) try { w.setCapacityWeightKg(new java.math.BigDecimal(Objects.toString(body.get("capacityWeightKg")))); } catch (Exception ignored) {}
            if (body.containsKey("capacityVolumeM3")) try { w.setCapacityVolumeM3(new java.math.BigDecimal(Objects.toString(body.get("capacityVolumeM3")))); } catch (Exception ignored) {}
            if (body.containsKey("operatingHours")) w.setOperatingHours(Objects.toString(body.get("operatingHours"), w.getOperatingHours()));
            if (body.containsKey("isActive")) w.setIsActive(Boolean.valueOf(Objects.toString(body.get("isActive"))));
            if (body.containsKey("contactName")) w.setContactName(Objects.toString(body.get("contactName"), w.getContactName()));
            if (body.containsKey("contactPhone")) w.setContactPhone(Objects.toString(body.get("contactPhone"), w.getContactPhone()));
            if (body.containsKey("organizationId")) {
                String orgId = Objects.toString(body.get("organizationId"), "");
                if (orgId.isEmpty()) {
                    w.setOrganization(null);
                } else {
                    try {
                        Organization org = dataManager.load(Organization.class).id(java.util.UUID.fromString(orgId)).one();
                        w.setOrganization(org);
                    } catch (Exception ignored) {}
                }
            }
            if (body.containsKey("managerUserId")) {
                String managerId = Objects.toString(body.get("managerUserId"), "").trim();
                if (managerId.isEmpty()) {
                    w.setManager(null);
                } else {
                    try {
                        User manager = dataManager.load(User.class).id(java.util.UUID.fromString(managerId)).one();
                        w.setManager(manager);
                    } catch (Exception ignored) {}
                }
            }
            dataManager.save(w);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/warehouses/{id}")
    public ResponseEntity<?> deleteWarehouse(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @PathVariable("id") UUID id) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            dataManager.remove(Id.of(id, com.donilogistics.entity.Warehouse.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // ===== Vehicles =====
    @GetMapping("/vehicles")
    public ResponseEntity<?> listVehicles(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<Vehicle> vehicles = dataManager.load(Vehicle.class).all().list();
            List<Map<String, Object>> dto = vehicles.stream().map(v -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", v.getId());
                m.put("licensePlate", v.getLicensePlate());
                m.put("make", v.getMake());
                m.put("model", v.getModel());
                m.put("year", v.getYear());
                m.put("vin", v.getVin());
                m.put("capacity", v.getCapacity());
                m.put("capacityUnit", v.getCapacityUnit());
                m.put("volumeCapacity", v.getVolumeCapacity());
                m.put("volumeUnit", v.getVolumeUnit());
                m.put("fuelType", v.getFuelType());
                m.put("status", v.getStatus());
                m.put("gpsTrackingEnabled", v.getGpsTrackingEnabled());
                m.put("currentLocation", v.getCurrentLocation());
                m.put("currentLatitude", v.getCurrentLatitude());
                m.put("currentLongitude", v.getCurrentLongitude());
                // Document fields
                if (v.getRegistrationDocument() != null) m.put("registrationDocument", v.getRegistrationDocument().toString());
                if (v.getInsuranceDocument() != null) m.put("insuranceDocument", v.getInsuranceDocument().toString());
                if (v.getPhoto() != null) m.put("photo", v.getPhoto().toString());
                if (v.getOrganization() != null) {
                    m.put("organization", Map.of("id", v.getOrganization().getId(), "name", v.getOrganization().getName()));
                }
                if (v.getAssignedDriver() != null) {
                    m.put("assignedDriver", Map.of("id", v.getAssignedDriver().getId(), "username", v.getAssignedDriver().getUsername()));
                }
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping(value = "/vehicles", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createVehicle(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            Vehicle v = dataManager.create(Vehicle.class);
            v.setLicensePlate(Objects.toString(body.getOrDefault("licensePlate", "")).trim());
            v.setMake(Objects.toString(body.getOrDefault("make", "")));
            v.setModel(Objects.toString(body.getOrDefault("model", "")));
            if (body.get("year") != null) try { v.setYear(Integer.valueOf(body.get("year").toString())); } catch (Exception ignored) {}
            v.setVin(Objects.toString(body.getOrDefault("vin", "")));
            if (body.get("capacity") != null) try { v.setCapacity(Double.valueOf(body.get("capacity").toString())); } catch (Exception ignored) {}
            v.setCapacityUnit(Objects.toString(body.getOrDefault("capacityUnit", "")));
            if (body.get("volumeCapacity") != null) try { v.setVolumeCapacity(Double.valueOf(body.get("volumeCapacity").toString())); } catch (Exception ignored) {}
            v.setVolumeUnit(Objects.toString(body.getOrDefault("volumeUnit", "")));
            v.setFuelType(Objects.toString(body.getOrDefault("fuelType", "")));
            v.setCurrentLocation(Objects.toString(body.getOrDefault("currentLocation", "")));
            if (body.get("currentLatitude") != null) try { v.setCurrentLatitude(Double.valueOf(body.get("currentLatitude").toString())); } catch (Exception ignored) {}
            if (body.get("currentLongitude") != null) try { v.setCurrentLongitude(Double.valueOf(body.get("currentLongitude").toString())); } catch (Exception ignored) {}
            if (body.get("gpsTrackingEnabled") != null) v.setGpsTrackingEnabled(Boolean.valueOf(body.get("gpsTrackingEnabled").toString()));
            String status = Objects.toString(body.getOrDefault("status", "")).trim();
            if (!status.isEmpty()) try { v.setStatus(VehicleStatus.valueOf(status)); } catch (Exception ignored) {}
            String orgId = Objects.toString(body.getOrDefault("organizationId", "")).trim();
            if (!orgId.isEmpty()) {
                Organization org = dataManager.load(Organization.class).id(UUID.fromString(orgId)).one();
                v.setOrganization(org);
            }
            String driverId = Objects.toString(body.getOrDefault("assignedDriverId", "")).trim();
            if (!driverId.isEmpty()) {
                User d = dataManager.load(User.class).id(UUID.fromString(driverId)).one();
                v.setAssignedDriver(d);
            }
            // FileRefs
            setVehicleFileRefsFromBody(v, body);
            Vehicle saved = dataManager.save(v);
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        });
    }

    @PutMapping(value = "/vehicles/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateVehicle(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @PathVariable("id") UUID id,
                                           @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            Vehicle v = dataManager.load(Vehicle.class).id(id).one();
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
            if (body.containsKey("status")) {
                String s = Objects.toString(body.get("status"), "");
                try { v.setStatus(VehicleStatus.valueOf(s)); } catch (Exception ignored) {}
            }
            if (body.containsKey("organizationId")) {
                String orgId = Objects.toString(body.get("organizationId"), "");
                if (orgId.isEmpty()) {
                    v.setOrganization(null);
                } else {
                    Organization org = dataManager.load(Organization.class).id(UUID.fromString(orgId)).one();
                    v.setOrganization(org);
                }
            }
            if (body.containsKey("assignedDriverId")) {
                String driverId = Objects.toString(body.get("assignedDriverId"), "");
                if (driverId.isEmpty()) {
                    v.setAssignedDriver(null);
                } else {
                    User d = dataManager.load(User.class).id(UUID.fromString(driverId)).one();
                    v.setAssignedDriver(d);
                }
            }
            // FileRefs
            setVehicleFileRefsFromBody(v, body);
            dataManager.save(v);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<?> deleteVehicle(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @PathVariable("id") UUID id) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            dataManager.remove(Id.of(id, Vehicle.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    private void setVehicleFileRefsFromBody(Vehicle v, Map<String, Object> body) {
        Object reg = body.get("registrationDocument");
        Object ins = body.get("insuranceDocument");
        Object photo = body.get("photo");
        if (reg instanceof Map) {
            FileRef ref = fileRefFromMap((Map<?, ?>) reg);
            if (ref != null) v.setRegistrationDocument(ref);
        }
        if (ins instanceof Map) {
            FileRef ref = fileRefFromMap((Map<?, ?>) ins);
            if (ref != null) v.setInsuranceDocument(ref);
        }
        if (photo instanceof Map) {
            FileRef ref = fileRefFromMap((Map<?, ?>) photo);
            if (ref != null) v.setPhoto(ref);
        }
    }

    private void setDriverFileRefsFromBody(DriverProfile d, Map<String, Object> body) {
        Object dl = body.get("drivingLicenseDocument");
        Object id = body.get("idDocument");
        if (dl instanceof Map) {
            FileRef ref = fileRefFromMap((Map<?, ?>) dl);
            if (ref != null) d.setDrivingLicenseDocument(ref);
        }
        if (id instanceof Map) {
            FileRef ref = fileRefFromMap((Map<?, ?>) id);
            if (ref != null) d.setIdDocument(ref);
        }
    }

    private FileRef fileRefFromMap(Map<?, ?> m) {
        try {
            String fileRef = Objects.toString(m.get("fileRef"));
            if (fileRef == null || fileRef.isBlank()) return null;
            return FileRef.fromString(fileRef);
        } catch (Exception e) { return null; }
    }

    @PostMapping(value = "/upload", consumes = { "multipart/form-data" })
    public ResponseEntity<?> upload(@RequestHeader(value = "Authorization", required = false) String auth,
                                    @RequestPart("file") org.springframework.web.multipart.MultipartFile file) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        try {
            FileStorage storage = fileStorageLocator.getDefault();
            FileRef ref = storage.saveStream(file.getOriginalFilename(), file.getInputStream());
            Map<String, Object> res = new HashMap<>();
            res.put("storageName", ref.getStorageName());
            res.put("fileName", ref.getFileName());
            res.put("fileRef", ref.toString());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/files")
    public ResponseEntity<?> downloadFile(@RequestHeader(value = "Authorization", required = false) String auth,
                                         @RequestParam("fileRef") String fileRef,
                                         @RequestParam(value = "token", required = false) String token) {
        // Check either header or query parameter for authorization
        String authToken = auth != null ? auth : (token != null ? "Bearer " + token : null);
        if (!isDevAdmin(authToken)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        try {
            FileRef ref = FileRef.fromString(fileRef);
            FileStorage storage = fileStorageLocator.getDefault();
            if (storage.fileExists(ref)) {
                InputStream inputStream = storage.openStream(ref);
                String fileName = ref.getFileName();
                return ResponseEntity.ok()
                        .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                        .header("Content-Type", getContentType(fileName))
                        .body(inputStream.readAllBytes());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String getContentType(String fileName) {
        if (fileName.toLowerCase().endsWith(".pdf")) return "application/pdf";
        if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) return "image/jpeg";
        if (fileName.toLowerCase().endsWith(".png")) return "image/png";
        if (fileName.toLowerCase().endsWith(".gif")) return "image/gif";
        if (fileName.toLowerCase().endsWith(".doc")) return "application/msword";
        if (fileName.toLowerCase().endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        return "application/octet-stream";
    }

    @PostMapping(value = "/notifications", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> sendNotification(@RequestHeader(value = "Authorization", required = false) String auth,
                                              @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        try {
            UUID recipientUserId = body.get("recipientUserId") != null && !Objects.toString(body.get("recipientUserId")).isBlank()
                    ? java.util.UUID.fromString(Objects.toString(body.get("recipientUserId"))) : null;
            UUID shipmentId = body.get("shipmentId") != null && !Objects.toString(body.get("shipmentId")).isBlank()
                    ? java.util.UUID.fromString(Objects.toString(body.get("shipmentId"))) : null;
            UUID orgId = body.get("organizationId") != null && !Objects.toString(body.get("organizationId")).isBlank()
                    ? java.util.UUID.fromString(Objects.toString(body.get("organizationId"))) : null;
            String title = Objects.toString(body.getOrDefault("title", ""));
            String message = Objects.toString(body.getOrDefault("message", ""));
            NotificationType type = NotificationType.valueOf(Objects.toString(body.getOrDefault("type", "GENERAL")));
            NotificationChannel channel = NotificationChannel.valueOf(Objects.toString(body.getOrDefault("channel", "IN_APP")));
            UUID id = notificationService.notifyUser(recipientUserId, title, message, type, channel, shipmentId, orgId);
            return ResponseEntity.ok(Map.of("id", id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== Notifications =====
    @GetMapping("/notifications")
    public ResponseEntity<?> listNotifications(@RequestHeader(value = "Authorization", required = false) String auth,
                                               @RequestParam(value = "recipientUserId", required = false) UUID recipientUserId) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Notification> list;
            if (recipientUserId != null) {
                list = dataManager.load(com.donilogistics.entity.Notification.class)
                        .query("select n from Notification n where n.recipient.id = :rid order by n.createdAt desc")
                        .parameter("rid", recipientUserId)
                        .list();
            } else {
                list = dataManager.load(com.donilogistics.entity.Notification.class)
                        .query("select n from Notification n order by n.createdAt desc")
                        .list();
            }
            List<Map<String, Object>> dto = list.stream().map(n -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", n.getId());
                m.put("title", n.getTitle());
                m.put("message", n.getMessage());
                m.put("type", n.getType());
                m.put("channel", n.getChannel());
                m.put("status", n.getStatus());
                m.put("read", n.getRead());
                m.put("createdAt", n.getCreatedAt());
                if (n.getRecipient() != null) m.put("recipient", Map.of("id", n.getRecipient().getId(), "username", n.getRecipient().getUsername()));
                if (n.getShipment() != null) m.put("shipment", Map.of("id", n.getShipment().getId(), "trackingNumber", n.getShipment().getTrackingNumber()));
                if (n.getOrganization() != null) m.put("organization", Map.of("id", n.getOrganization().getId(), "name", n.getOrganization().getName()));
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    // ===== Containers =====
    @GetMapping("/containers")
    public ResponseEntity<?> listContainers(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Container> containers = dataManager.load(com.donilogistics.entity.Container.class).all().list();
            List<Map<String, Object>> dto = containers.stream().map(c -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", c.getId());
                m.put("containerNumber", c.getContainerNumber());
                m.put("type", c.getType());
                m.put("status", c.getStatus());
                m.put("ownerName", c.getOwnerName());
                m.put("ownerEmail", c.getOwnerEmail());
                m.put("ownerPhone", c.getOwnerPhone());
                m.put("assetTag", c.getAssetTag());
                m.put("manufactureYear", c.getManufactureYear());
                m.put("tareWeightKg", c.getTareWeightKg());
                m.put("maxGrossWeightKg", c.getMaxGrossWeightKg());
                m.put("maxVolumeM3", c.getMaxVolumeM3());
                if (c.getOrganization() != null) m.put("organization", Map.of("id", c.getOrganization().getId(), "name", c.getOrganization().getName()));
                if (c.getCurrentWarehouse() != null) m.put("currentWarehouse", Map.of("id", c.getCurrentWarehouse().getId(), "name", c.getCurrentWarehouse().getName()));
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(@RequestHeader(value = "Authorization", required = false) String auth,
                                                  @PathVariable("id") UUID id) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        notificationService.markRead(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ===== Driver live location updates (manual/mock) =====
    @PostMapping(value = "/drivers/{id}/location", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateDriverLocation(@RequestHeader(value = "Authorization", required = false) String auth,
                                                  @PathVariable("id") UUID driverId,
                                                  @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.DriverProfile d = dataManager.load(com.donilogistics.entity.DriverProfile.class).id(driverId).optional().orElse(null);
            if (d == null) return ResponseEntity.status(404).body(Map.of("error", "driver not found"));
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

    @PostMapping(value = "/containers", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createContainer(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
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
            String orgId = Objects.toString(body.getOrDefault("organizationId", "")).trim();
            if (!orgId.isEmpty()) {
                try { c.setOrganization(dataManager.load(Organization.class).id(java.util.UUID.fromString(orgId)).one()); } catch (Exception ignored) {}
            }
            String whId = Objects.toString(body.getOrDefault("currentWarehouseId", "")).trim();
            if (!whId.isEmpty()) {
                try { c.setCurrentWarehouse(dataManager.load(com.donilogistics.entity.Warehouse.class).id(java.util.UUID.fromString(whId)).one()); } catch (Exception ignored) {}
            }
            com.donilogistics.entity.Container saved = dataManager.save(c);
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        });
    }

    @PutMapping(value = "/containers/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateContainer(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @PathVariable("id") UUID id,
                                             @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Container c = dataManager.load(com.donilogistics.entity.Container.class).id(id).one();
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
            if (body.containsKey("organizationId")) {
                String orgId = Objects.toString(body.get("organizationId"), "");
                if (orgId.isEmpty()) { c.setOrganization(null); }
                else { try { c.setOrganization(dataManager.load(Organization.class).id(java.util.UUID.fromString(orgId)).one()); } catch (Exception ignored) {} }
            }
            if (body.containsKey("currentWarehouseId")) {
                String whId = Objects.toString(body.get("currentWarehouseId"), "");
                if (whId.isEmpty()) { c.setCurrentWarehouse(null); }
                else { try { c.setCurrentWarehouse(dataManager.load(com.donilogistics.entity.Warehouse.class).id(java.util.UUID.fromString(whId)).one()); } catch (Exception ignored) {} }
            }
            dataManager.save(c);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/containers/{id}")
    public ResponseEntity<?> deleteContainer(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @PathVariable("id") UUID id) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            dataManager.remove(Id.of(id, com.donilogistics.entity.Container.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // ===== Driver Profiles =====
    @GetMapping("/drivers")
    public ResponseEntity<?> listDrivers(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<DriverProfile> drivers = dataManager.load(DriverProfile.class).all().list();
            List<Map<String, Object>> dto = drivers.stream().map(d -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", d.getId());
                m.put("bloodType", d.getBloodType());
                m.put("drivingLicenseNumber", d.getDrivingLicenseNumber());
                m.put("age", d.getAge());
                m.put("hiredDate", d.getHiredDate());
                m.put("drivingLicenseIssueDate", d.getDrivingLicenseIssueDate());
                m.put("drivingLicenseExpiryDate", d.getDrivingLicenseExpiryDate());
                m.put("active", d.getActive());
                m.put("currentLatitude", d.getCurrentLatitude());
                m.put("currentLongitude", d.getCurrentLongitude());
                m.put("lastSeen", d.getLastSeen());
                // Document fields
                if (d.getDrivingLicenseDocument() != null) m.put("drivingLicenseDocument", d.getDrivingLicenseDocument().toString());
                if (d.getIdDocument() != null) m.put("idDocument", d.getIdDocument().toString());
                if (d.getUser() != null) m.put("user", Map.of("id", d.getUser().getId(), "username", d.getUser().getUsername(), "email", d.getUser().getEmail()));
                if (d.getOrganization() != null) m.put("organization", Map.of("id", d.getOrganization().getId(), "name", d.getOrganization().getName()));
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping(value = "/drivers", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createDriver(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            DriverProfile d = dataManager.create(DriverProfile.class);
            String userId = Objects.toString(body.getOrDefault("userId", ""));
            if (!userId.isEmpty()) d.setUser(dataManager.load(User.class).id(UUID.fromString(userId)).one());
            String orgId = Objects.toString(body.getOrDefault("organizationId", ""));
            if (!orgId.isEmpty()) d.setOrganization(dataManager.load(Organization.class).id(UUID.fromString(orgId)).one());
            d.setBloodType(Objects.toString(body.getOrDefault("bloodType", "")));
            d.setDrivingLicenseNumber(Objects.toString(body.getOrDefault("drivingLicenseNumber", "")));
            if (body.get("age") != null) try { d.setAge(Integer.valueOf(Objects.toString(body.get("age")))); } catch (Exception ignored) {}
            if (body.get("hiredDate") != null) d.setHiredDate(java.time.LocalDate.parse(Objects.toString(body.get("hiredDate"))));
            if (body.get("drivingLicenseIssueDate") != null) d.setDrivingLicenseIssueDate(java.time.LocalDate.parse(Objects.toString(body.get("drivingLicenseIssueDate"))));
            if (body.get("drivingLicenseExpiryDate") != null) d.setDrivingLicenseExpiryDate(java.time.LocalDate.parse(Objects.toString(body.get("drivingLicenseExpiryDate"))));
            d.setActive(Boolean.valueOf(Objects.toString(body.getOrDefault("active", "true"))));
            // FileRefs
            setDriverFileRefsFromBody(d, body);
            DriverProfile saved = dataManager.save(d);
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        });
    }

    @PutMapping(value = "/drivers/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateDriver(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @PathVariable("id") UUID id,
                                          @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            DriverProfile d = dataManager.load(DriverProfile.class).id(id).one();
            if (body.containsKey("userId")) {
                String userId = Objects.toString(body.get("userId"), "");
                d.setUser(userId.isEmpty() ? null : dataManager.load(User.class).id(UUID.fromString(userId)).one());
            }
            if (body.containsKey("organizationId")) {
                String orgId = Objects.toString(body.get("organizationId"), "");
                d.setOrganization(orgId.isEmpty() ? null : dataManager.load(Organization.class).id(UUID.fromString(orgId)).one());
            }
            if (body.containsKey("bloodType")) d.setBloodType(Objects.toString(body.get("bloodType"), d.getBloodType()));
            if (body.containsKey("drivingLicenseNumber")) d.setDrivingLicenseNumber(Objects.toString(body.get("drivingLicenseNumber"), d.getDrivingLicenseNumber()));
            if (body.containsKey("age")) try { d.setAge(Integer.valueOf(Objects.toString(body.get("age")))); } catch (Exception ignored) {}
            if (body.containsKey("hiredDate")) d.setHiredDate(java.time.LocalDate.parse(Objects.toString(body.get("hiredDate"))));
            if (body.containsKey("drivingLicenseIssueDate")) d.setDrivingLicenseIssueDate(java.time.LocalDate.parse(Objects.toString(body.get("drivingLicenseIssueDate"))));
            if (body.containsKey("drivingLicenseExpiryDate")) d.setDrivingLicenseExpiryDate(java.time.LocalDate.parse(Objects.toString(body.get("drivingLicenseExpiryDate"))));
            if (body.containsKey("active")) d.setActive(Boolean.valueOf(Objects.toString(body.get("active"))));
            // FileRefs
            setDriverFileRefsFromBody(d, body);
            dataManager.save(d);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/drivers/{id}")
    public ResponseEntity<?> deleteDriver(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @PathVariable("id") UUID id) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            dataManager.remove(Id.of(id, DriverProfile.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @GetMapping("/organizations")
    public ResponseEntity<?> listOrganizations(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<Organization> orgs = dataManager.load(Organization.class).all().list();
            List<Map<String, Object>> dto = orgs.stream().map(o -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", o.getId());
                m.put("name", o.getName());
                m.put("code", o.getCode());
                m.put("active", o.getActive());
                m.put("email", o.getEmail());
                m.put("orgType", o.getOrgType());
                m.put("website", o.getWebsite());
                m.put("phoneNumber", o.getPhoneNumber());
                m.put("address", o.getAddress());
                m.put("businessLicenseNumber", o.getBusinessLicenseNumber());
                m.put("registrationDocument", o.getRegistrationDocument());
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> metrics(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            long orgs = dataManager.load(Organization.class).all().list().size();
            long users = dataManager.load(User.class).all().list().size();
            Map<String, Object> m = new HashMap<>();
            m.put("organizations", orgs);
            m.put("users", users);
            return ResponseEntity.ok(m);
        });
    }

    @PostMapping(value = "/organizations", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createOrganization(@RequestHeader(value = "Authorization", required = false) String auth,
                                                @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            Organization org = dataManager.create(Organization.class);
            org.setName(Objects.toString(body.getOrDefault("name", "")).trim());
            org.setCode(Objects.toString(body.getOrDefault("code", "")).trim());
            org.setDescription(Objects.toString(body.getOrDefault("description", "")).trim());
            org.setEmail(Objects.toString(body.getOrDefault("email", "")).trim());
            org.setPhoneNumber(Objects.toString(body.getOrDefault("phoneNumber", "")).trim());
            org.setAddress(Objects.toString(body.getOrDefault("address", "")).trim());
            org.setWebsite(Objects.toString(body.getOrDefault("website", "")).trim());
            org.setBusinessLicenseNumber(Objects.toString(body.getOrDefault("businessLicenseNumber", "")).trim());
            String orgType = Objects.toString(body.getOrDefault("orgType", "")).trim();
            if (!orgType.isEmpty()) try { org.setOrgType(Enum.valueOf(com.donilogistics.entity.OrganizationType.class, orgType)); } catch (Exception ignored) {}
            org.setActive(Boolean.valueOf(Objects.toString(body.getOrDefault("active", "true"))));
            Organization saved = dataManager.save(org);
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        });
    }

    @PutMapping(value = "/organizations/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateOrganization(@RequestHeader(value = "Authorization", required = false) String auth,
                                                @PathVariable("id") UUID id,
                                                @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            Organization org = dataManager.load(Organization.class).id(id).one();
            if (body.containsKey("name")) org.setName(Objects.toString(body.get("name"), org.getName()));
            if (body.containsKey("code")) org.setCode(Objects.toString(body.get("code"), org.getCode()));
            if (body.containsKey("description")) org.setDescription(Objects.toString(body.get("description"), org.getDescription()));
            if (body.containsKey("email")) org.setEmail(Objects.toString(body.get("email"), org.getEmail()));
            if (body.containsKey("phoneNumber")) org.setPhoneNumber(Objects.toString(body.get("phoneNumber"), org.getPhoneNumber()));
            if (body.containsKey("address")) org.setAddress(Objects.toString(body.get("address"), org.getAddress()));
            if (body.containsKey("website")) org.setWebsite(Objects.toString(body.get("website"), org.getWebsite()));
            if (body.containsKey("businessLicenseNumber")) org.setBusinessLicenseNumber(Objects.toString(body.get("businessLicenseNumber"), org.getBusinessLicenseNumber()));
            if (body.containsKey("active")) org.setActive(Boolean.valueOf(Objects.toString(body.get("active"))));
            if (body.containsKey("orgType")) {
                String t = Objects.toString(body.get("orgType"), "");
                try { org.setOrgType(Enum.valueOf(com.donilogistics.entity.OrganizationType.class, t)); } catch (Exception ignored) {}
            }
            dataManager.save(org);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/organizations/{id}")
    public ResponseEntity<?> deleteOrganization(@RequestHeader(value = "Authorization", required = false) String auth,
                                                @PathVariable("id") UUID id) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            dataManager.remove(Id.of(id, Organization.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<User> users = dataManager.load(User.class).all().list();
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

    @PostMapping("/users/{id}/role")
    public ResponseEntity<?> setUserRole(@RequestHeader(value = "Authorization", required = false) String auth,
                                         @PathVariable("id") UUID userId,
                                         @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            User u = dataManager.load(User.class).id(userId).one();
            String role = Objects.toString(body.getOrDefault("userRole", ""));
            try {
                u.setUserRole(UserRole.valueOf(role));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
            }
            dataManager.save(u);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // Dev-only: create a test DRIVER user and DriverProfile quickly (safer path to avoid mapping conflicts)
    @PostMapping(value = "/dev/create-driver", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> devCreateDriver(@RequestHeader(value = "Authorization", required = false) String auth,
                                             @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            try {
                String username = Objects.toString(body.getOrDefault("username", "driver1")).trim();
                String email = Objects.toString(body.getOrDefault("email", username + "@example.com")).trim();
                String firstName = Objects.toString(body.getOrDefault("firstName", "Test"));
                String lastName = Objects.toString(body.getOrDefault("lastName", "Driver"));
                String orgIdStr = Objects.toString(body.getOrDefault("organizationId", ""));

                Organization org;
                if (!orgIdStr.isEmpty()) {
                    org = dataManager.load(Organization.class).id(UUID.fromString(orgIdStr)).one();
                } else {
                    // pick any existing org
                    org = dataManager.load(Organization.class).all().list().stream().findFirst().orElse(null);
                }

                // create user
                User user = dataManager.create(User.class);
                user.setUsername(username);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("Password1!"));
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setActive(true);
                user.setEmailVerified(true);
                user.setUserRole(UserRole.DRIVER);
                if (org != null) user.setOrganization(org);
                user = dataManager.save(user);

                // create driver profile
                DriverProfile d = dataManager.create(DriverProfile.class);
                d.setUser(user);
                if (org != null) d.setOrganization(org);
                d.setActive(true);
                d = dataManager.save(d);

                Map<String, Object> res = new HashMap<>();
                res.put("userId", user.getId());
                res.put("driverProfileId", d.getId());
                res.put("organizationId", org != null ? org.getId() : null);
                res.put("username", user.getUsername());
                res.put("email", user.getEmail());
                return ResponseEntity.ok(res);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        });
    }

    @PostMapping("/users/{id}/organization")
    public ResponseEntity<?> setUserOrganization(@RequestHeader(value = "Authorization", required = false) String auth,
                                                 @PathVariable("id") UUID userId,
                                                 @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            User u = dataManager.load(User.class).id(userId).one();
            String orgIdStr = Objects.toString(body.getOrDefault("organizationId", ""));
            if (orgIdStr.isEmpty()) {
                u.setOrganization(null);
            } else {
                UUID orgId = UUID.fromString(orgIdStr);
                Organization org = dataManager.load(Organization.class).id(orgId).one();
                u.setOrganization(org);
            }
            dataManager.save(u);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @PostMapping("/users/{id}/activate")
    public ResponseEntity<?> activateUser(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @PathVariable("id") UUID userId) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            User u = dataManager.load(User.class).id(userId).one();
            u.setActive(true);
            dataManager.save(u);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @PostMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@RequestHeader(value = "Authorization", required = false) String auth,
                                            @PathVariable("id") UUID userId) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            User u = dataManager.load(User.class).id(userId).one();
            u.setActive(false);
            dataManager.save(u);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@RequestHeader(value = "Authorization", required = false) String auth,
                                        @PathVariable("id") UUID userId) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            dataManager.remove(Id.of(userId, User.class));
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    // ===== Shipments =====
    @GetMapping("/shipments")
    public ResponseEntity<?> listShipments(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Shipment> shipments = dataManager.load(com.donilogistics.entity.Shipment.class).all().list();
            log.info("GET /api/admin/shipments -> {} records", shipments.size());
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
                if (s.getPickupAddress() != null) m.put("pickupAddress", Map.of(
                        "id", s.getPickupAddress().getId(),
                        "city", s.getPickupAddress().getCity(),
                        "country", s.getPickupAddress().getCountry()
                ));
                if (s.getDeliveryAddress() != null) m.put("deliveryAddress", Map.of(
                        "id", s.getDeliveryAddress().getId(),
                        "city", s.getDeliveryAddress().getCity(),
                        "country", s.getDeliveryAddress().getCountry()
                ));
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    // Assign shipment to a driver (accept)
    @PostMapping(value = "/shipments/{id}/accept", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> acceptShipment(@RequestHeader(value = "Authorization", required = false) String auth,
                                            @PathVariable("id") UUID shipmentId,
                                            @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Shipment s = dataManager.load(com.donilogistics.entity.Shipment.class).id(shipmentId).optional().orElse(null);
            if (s == null) return ResponseEntity.status(404).body(Map.of("error", "shipment not found"));
            String driverUserIdStr = Objects.toString(body.getOrDefault("driverUserId", ""));
            if (driverUserIdStr.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "driverUserId is required"));
            try {
                log.info("POST /api/admin/shipments/{}/accept driverUserId={}", shipmentId, driverUserIdStr);
                User driverUser = dataManager.load(User.class).id(UUID.fromString(driverUserIdStr)).one();
                s.setAssignedDriver(driverUser);
                s.setAssignedAt(java.time.LocalDateTime.now());
                dataManager.save(s);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "assignedDriverId", driverUser.getId(),
                        "shipmentId", s.getId()
                ));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        });
    }

    // Unassign shipment from a driver (reject when previously accepted)
    @PostMapping(value = "/shipments/{id}/reject", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> rejectShipment(@RequestHeader(value = "Authorization", required = false) String auth,
                                            @PathVariable("id") UUID shipmentId,
                                            @RequestBody(required = false) Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Shipment s = dataManager.load(com.donilogistics.entity.Shipment.class).id(shipmentId).optional().orElse(null);
            if (s == null) return ResponseEntity.status(404).body(Map.of("error", "shipment not found"));
            log.info("POST /api/admin/shipments/{}/reject (unassign)", shipmentId);
            s.setAssignedDriver(null);
            s.setAssignedAt(null);
            dataManager.save(s);
            return ResponseEntity.ok(Map.of("success", true));
        });
    }

    @PostMapping(value = "/shipments", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> createShipment(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            try {
                log.info("POST /api/admin/shipments body keys: {}", body.keySet());
                com.donilogistics.entity.Shipment s = dataManager.create(com.donilogistics.entity.Shipment.class);
                s.setExternalOrderId(Objects.toString(body.getOrDefault("externalOrderId", "")).trim());
                s.setTrackingNumber(Objects.toString(body.getOrDefault("trackingNumber", "")).trim());
                s.setCommodityType(Objects.toString(body.getOrDefault("commodityType", "")));
                if (body.get("weightKg") != null) try { s.setWeightKg(new java.math.BigDecimal(body.get("weightKg").toString())); } catch (Exception ignored) {}
                s.setStatus(com.donilogistics.entity.ShipmentStatus.valueOf(Objects.toString(body.getOrDefault("status", "CREATED"))));

                if (body.get("lengthCm") != null) try { s.setLengthCm(new java.math.BigDecimal(body.get("lengthCm").toString())); } catch (Exception ignored) {}
                if (body.get("widthCm") != null) try { s.setWidthCm(new java.math.BigDecimal(body.get("widthCm").toString())); } catch (Exception ignored) {}
                if (body.get("heightCm") != null) try { s.setHeightCm(new java.math.BigDecimal(body.get("heightCm").toString())); } catch (Exception ignored) {}
                if (body.get("declaredValue") != null) try { s.setDeclaredValue(new java.math.BigDecimal(body.get("declaredValue").toString())); } catch (Exception ignored) {}
                if (body.get("dimsConfirmed") != null) s.setDimsConfirmed(Boolean.valueOf(body.get("dimsConfirmed").toString()));
                if (body.get("consolidationAllowed") != null) s.setConsolidationAllowed(Boolean.valueOf(body.get("consolidationAllowed").toString()));
                if (body.get("consolidationPriority") != null) try { s.setConsolidationPriority(Integer.valueOf(body.get("consolidationPriority").toString())); } catch (Exception ignored) {}
                if (body.get("ecoMode") != null) try { s.setEcoMode(com.donilogistics.entity.EcoMode.valueOf(Objects.toString(body.get("ecoMode")))); } catch (Exception ignored) {}

                // Optional customer link
                if (body.get("customerId") != null && !Objects.toString(body.get("customerId")).isBlank()) {
                    try {
                        com.donilogistics.entity.Organization org = dataManager.load(com.donilogistics.entity.Organization.class).id(UUID.fromString(Objects.toString(body.get("customerId")))).one();
                        s.setCustomer(org);
                    } catch (Exception ignored) {}
                }

                // Associate creator user if provided
                if (body.get("createdByUserId") != null && !Objects.toString(body.get("createdByUserId")).isBlank()) {
                    try {
                        com.donilogistics.entity.User creator = dataManager.load(com.donilogistics.entity.User.class).id(UUID.fromString(Objects.toString(body.get("createdByUserId")))).one();
                        s.setCreatedByUser(creator);
                    } catch (Exception ignored) {}
                }

                Map<String, Object> pickup = (Map<String, Object>) body.get("pickupAddress");
                if (pickup != null) {
                    com.donilogistics.entity.Address a = dataManager.create(com.donilogistics.entity.Address.class);
                    a.setName(Objects.toString(pickup.get("name"), null));
                    a.setContact(Objects.toString(pickup.get("contact"), null));
                    a.setPhone(Objects.toString(pickup.get("phone"), null));
                    a.setStreet(Objects.toString(pickup.get("street"), null));
                    a.setCity(Objects.toString(pickup.get("city"), null));
                    a.setState(Objects.toString(pickup.get("state"), null));
                    a.setCountry(Objects.toString(pickup.get("country"), null));
                    a.setPostalCode(Objects.toString(pickup.get("postalCode"), null));
                    if (pickup.get("latitude") != null) try { a.setLatitude(new java.math.BigDecimal(pickup.get("latitude").toString())); } catch (Exception ignored) {}
                    if (pickup.get("longitude") != null) try { a.setLongitude(new java.math.BigDecimal(pickup.get("longitude").toString())); } catch (Exception ignored) {}
                    a = dataManager.save(a);
                    s.setPickupAddress(a);
                }

                Map<String, Object> delivery = (Map<String, Object>) body.get("deliveryAddress");
                if (delivery != null) {
                    com.donilogistics.entity.Address a = dataManager.create(com.donilogistics.entity.Address.class);
                    a.setName(Objects.toString(delivery.get("name"), null));
                    a.setContact(Objects.toString(delivery.get("contact"), null));
                    a.setPhone(Objects.toString(delivery.get("phone"), null));
                    a.setStreet(Objects.toString(delivery.get("street"), null));
                    a.setCity(Objects.toString(delivery.get("city"), null));
                    a.setState(Objects.toString(delivery.get("state"), null));
                    a.setCountry(Objects.toString(delivery.get("country"), null));
                    a.setPostalCode(Objects.toString(delivery.get("postalCode"), null));
                    if (delivery.get("latitude") != null) try { a.setLatitude(new java.math.BigDecimal(delivery.get("latitude").toString())); } catch (Exception ignored) {}
                    if (delivery.get("longitude") != null) try { a.setLongitude(new java.math.BigDecimal(delivery.get("longitude").toString())); } catch (Exception ignored) {}
                    a = dataManager.save(a);
                    s.setDeliveryAddress(a);
                }

                com.donilogistics.entity.Shipment saved = dataManager.save(s);
                log.info("Created shipment {} tracking={} status={}", saved.getId(), saved.getTrackingNumber(), saved.getStatus());

                Map<String, Object> response = new HashMap<>();
                response.put("id", saved.getId());
                response.put("externalOrderId", saved.getExternalOrderId());
                response.put("trackingNumber", saved.getTrackingNumber());
                response.put("status", saved.getStatus().name());
                response.put("commodityType", saved.getCommodityType());
                response.put("weightKg", saved.getWeightKg());
                response.put("createdAt", saved.getCreatedAt());
                // fire a notification to org admins / warehouse managers if available
                try {
                    UUID orgId = saved.getCustomer() != null ? saved.getCustomer().getId() : null;
                    notificationService.notifyUser(null,
                            "New shipment created",
                            "Shipment " + (saved.getTrackingNumber() != null ? saved.getTrackingNumber() : "") + " has been created.",
                            NotificationType.SHIPMENT_STATUS,
                            NotificationChannel.IN_APP,
                            saved.getId(),
                            orgId);
                } catch (Exception ignored) {}
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                log.error("Failed to create shipment", e);
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to create shipment", "message", e.getMessage()));
            }
        });
    }

    @PutMapping(value = "/shipments/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateShipment(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @PathVariable("id") UUID id,
                                           @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Shipment s = dataManager.load(com.donilogistics.entity.Shipment.class).id(Id.of(id)).optional().orElse(null);
            if (s == null) return ResponseEntity.status(404).body(Map.of("error", "shipment not found"));
            
            if (body.get("externalOrderId") != null) s.setExternalOrderId(Objects.toString(body.get("externalOrderId"), "").trim());
            if (body.get("commodityType") != null) s.setCommodityType(Objects.toString(body.get("commodityType"), ""));
            if (body.get("weightKg") != null) try { s.setWeightKg(new java.math.BigDecimal(body.get("weightKg").toString())); } catch (Exception ignored) {}
            if (body.get("lengthCm") != null) try { s.setLengthCm(new java.math.BigDecimal(body.get("lengthCm").toString())); } catch (Exception ignored) {}
            if (body.get("widthCm") != null) try { s.setWidthCm(new java.math.BigDecimal(body.get("widthCm").toString())); } catch (Exception ignored) {}
            if (body.get("heightCm") != null) try { s.setHeightCm(new java.math.BigDecimal(body.get("heightCm").toString())); } catch (Exception ignored) {}
            if (body.get("declaredValue") != null) try { s.setDeclaredValue(new java.math.BigDecimal(body.get("declaredValue").toString())); } catch (Exception ignored) {}
            if (body.get("dimsConfirmed") != null) s.setDimsConfirmed(Objects.toString(body.get("dimsConfirmed")).equals("true"));
            if (body.get("consolidationAllowed") != null) s.setConsolidationAllowed(Objects.toString(body.get("consolidationAllowed")).equals("true"));
            if (body.get("consolidationPriority") != null) try { s.setConsolidationPriority(Integer.valueOf(body.get("consolidationPriority").toString())); } catch (Exception ignored) {}
            if (body.get("ecoMode") != null) s.setEcoMode(com.donilogistics.entity.EcoMode.valueOf(Objects.toString(body.get("ecoMode"))));
            if (body.get("routingPreferences") != null) s.setRoutingPreferences(Objects.toString(body.get("routingPreferences"), ""));
            if (body.get("status") != null) s.setStatus(com.donilogistics.entity.ShipmentStatus.valueOf(Objects.toString(body.get("status"))));
            
            dataManager.save(s);
            return ResponseEntity.ok(Map.of("message", "shipment updated"));
        });
    }

    @DeleteMapping("/shipments/{id}")
    public ResponseEntity<?> deleteShipment(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @PathVariable("id") UUID id) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.Shipment shipment = dataManager.load(com.donilogistics.entity.Shipment.class).id(Id.of(id)).optional().orElse(null);
            if (shipment == null) return ResponseEntity.status(404).body(Map.of("error", "shipment not found"));
            dataManager.remove(shipment);
            return ResponseEntity.ok(Map.of("message", "shipment deleted"));
        });
    }

    // ===== Addresses =====
    @GetMapping("/addresses")
    public ResponseEntity<?> listAddresses(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Address> addresses = dataManager.load(com.donilogistics.entity.Address.class).all().list();
            List<Map<String, Object>> dto = addresses.stream().map(a -> {
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
                m.put("geohash", a.getGeohash());
                m.put("addressType", a.getAddressType());
                m.put("isActive", a.getIsActive());
                if (a.getOrganization() != null) {
                    m.put("organization", Map.of("id", a.getOrganization().getId(), "name", a.getOrganization().getName()));
                }
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    // ===== Consolidations =====
    @GetMapping("/consolidations")
    public ResponseEntity<?> listConsolidations(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            List<com.donilogistics.entity.Consolidation> consolidations = dataManager.load(com.donilogistics.entity.Consolidation.class).all().list();
            List<Map<String, Object>> dto = consolidations.stream().map(c -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", c.getId());
                m.put("status", c.getStatus());
                m.put("plannedDepartureTime", c.getPlannedDepartureTime());
                m.put("plannedArrivalTime", c.getPlannedArrivalTime());
                m.put("aggregatedWeight", c.getAggregatedWeight());
                m.put("aggregatedVolume", c.getAggregatedVolume());
                m.put("consolidationPolicy", c.getConsolidationPolicy());
                m.put("ecoModeApplied", c.getEcoModeApplied());
                m.put("createdAt", c.getCreatedAt());
                m.put("sealedAt", c.getSealedAt());
                m.put("dispatchedAt", c.getDispatchedAt());
                if (c.getOriginWarehouse() != null) {
                    m.put("originWarehouse", Map.of("id", c.getOriginWarehouse().getId(), "name", c.getOriginWarehouse().getName()));
                }
                if (c.getDestWarehouse() != null) {
                    m.put("destWarehouse", Map.of("id", c.getDestWarehouse().getId(), "name", c.getDestWarehouse().getName()));
                }
                if (c.getOrganization() != null) {
                    m.put("organization", Map.of("id", c.getOrganization().getId(), "name", c.getOrganization().getName()));
                }
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dto);
        });
    }

    @PostMapping(value = "/consolidations/plan", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> planConsolidation(@RequestHeader(value = "Authorization", required = false) String auth,
                                               @RequestBody Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            try {
                UUID originId = body.get("originAddressId") != null && !Objects.toString(body.get("originAddressId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("originAddressId"))) : null;
                UUID destId = body.get("destAddressId") != null && !Objects.toString(body.get("destAddressId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("destAddressId"))) : null;

                // Optional warehouse-based planning: if address not provided, allow warehouse IDs
                UUID originWarehouseId = body.get("originWarehouseId") != null && !Objects.toString(body.get("originWarehouseId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("originWarehouseId"))) : null;
                UUID destWarehouseId = body.get("destWarehouseId") != null && !Objects.toString(body.get("destWarehouseId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("destWarehouseId"))) : null;

                if (originId == null && originWarehouseId != null) {
                    try {
                        com.donilogistics.entity.Warehouse w = dataManager.load(com.donilogistics.entity.Warehouse.class).id(originWarehouseId).one();
                        if (w.getLatitude() == null || w.getLongitude() == null) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Origin warehouse has no lat/lon"));
                        }
                        com.donilogistics.entity.Address a = dataManager.create(com.donilogistics.entity.Address.class);
                        a.setName(((w.getCode() != null ? w.getCode() + " " : "")) + Objects.toString(w.getName(), "Warehouse"));
                        a.setStreet(w.getAddressLine1());
                        a.setCity(w.getCity());
                        a.setState(w.getState());
                        a.setCountry(w.getCountry());
                        a.setPostalCode(w.getPostalCode());
                        a.setLatitude(w.getLatitude());
                        a.setLongitude(w.getLongitude());
                        a = dataManager.save(a);
                        originId = a.getId();
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Invalid originWarehouseId"));
                    }
                }
                if (destId == null && destWarehouseId != null) {
                    try {
                        com.donilogistics.entity.Warehouse w = dataManager.load(com.donilogistics.entity.Warehouse.class).id(destWarehouseId).one();
                        if (w.getLatitude() == null || w.getLongitude() == null) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Destination warehouse has no lat/lon"));
                        }
                        com.donilogistics.entity.Address a = dataManager.create(com.donilogistics.entity.Address.class);
                        a.setName(((w.getCode() != null ? w.getCode() + " " : "")) + Objects.toString(w.getName(), "Warehouse"));
                        a.setStreet(w.getAddressLine1());
                        a.setCity(w.getCity());
                        a.setState(w.getState());
                        a.setCountry(w.getCountry());
                        a.setPostalCode(w.getPostalCode());
                        a.setLatitude(w.getLatitude());
                        a.setLongitude(w.getLongitude());
                        a = dataManager.save(a);
                        destId = a.getId();
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Invalid destWarehouseId"));
                    }
                }
                UUID vehicleId = body.get("vehicleId") != null && !Objects.toString(body.get("vehicleId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("vehicleId"))) : null;
                UUID driverId = body.get("driverId") != null && !Objects.toString(body.get("driverId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("driverId"))) : null;
                UUID orgId = body.get("organizationId") != null && !Objects.toString(body.get("organizationId")).isBlank()
                        ? java.util.UUID.fromString(Objects.toString(body.get("organizationId"))) : null;

                List<String> sids = (List<String>) body.getOrDefault("shipmentIds", Collections.emptyList());
                List<java.util.UUID> shipmentIds = new ArrayList<>();
                for (String s : sids) {
                    try { shipmentIds.add(java.util.UUID.fromString(s)); } catch (Exception ignored) {}
                }

                java.util.UUID routePlanId = consolidationService.createConsolidationAndPlanRoute(originId, destId, shipmentIds, vehicleId, driverId, orgId);
                return ResponseEntity.ok(Map.of("routePlanId", routePlanId));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        });
    }

    @GetMapping("/route-plans/{id}")
    public ResponseEntity<?> getRoutePlan(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @PathVariable("id") UUID id) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.RoutePlan plan = dataManager.load(com.donilogistics.entity.RoutePlan.class).id(id).optional().orElse(null);
            if (plan == null) return ResponseEntity.status(404).body(Map.of("error", "route plan not found"));
            List<com.donilogistics.entity.RouteStop> stops = dataManager.load(com.donilogistics.entity.RouteStop.class)
                    .query("select s from RouteStop s where s.routePlan.id = :pid order by s.sequenceNo asc")
                    .parameter("pid", id)
                    .list();
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", plan.getId());
            dto.put("name", plan.getName());
            dto.put("routeStatus", plan.getRouteStatus());
            if (plan.getVehicle() != null) dto.put("vehicle", Map.of("id", plan.getVehicle().getId(), "licensePlate", plan.getVehicle().getLicensePlate()));
            if (plan.getDriver() != null) dto.put("driver", Map.of("id", plan.getDriver().getId()));
            dto.put("createdAt", plan.getCreatedAt());
            dto.put("updatedAt", plan.getUpdatedAt());
            dto.put("solverMeta", plan.getSolverMeta());
            List<Map<String, Object>> sDto = new ArrayList<>();
            for (com.donilogistics.entity.RouteStop s : stops) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", s.getId());
                m.put("sequenceNo", s.getSequenceNo());
                m.put("lat", s.getLat());
                m.put("lon", s.getLon());
                m.put("stopType", s.getStopType());
                if (s.getShipment() != null) {
                    m.put("shipment", Map.of("id", s.getShipment().getId(), "trackingNumber", s.getShipment().getTrackingNumber()));
                }
                if (s.getWarehouse() != null) {
                    m.put("warehouse", Map.of("id", s.getWarehouse().getId(), "name", s.getWarehouse().getName()));
                }
                sDto.add(m);
            }
            dto.put("stops", sDto);
            return ResponseEntity.ok(dto);
        });
    }

    // Calculate a simple route geometry for a shipment from driver's current position to pickup then to delivery
    @GetMapping("/shipments/{id}/route")
    public ResponseEntity<?> shipmentRoute(@RequestHeader(value = "Authorization", required = false) String auth,
                                           @PathVariable("id") UUID shipmentId,
                                           @RequestParam(value = "driverProfileId", required = false) UUID driverProfileId) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            try {
                var shipment = dataManager.load(com.donilogistics.entity.Shipment.class).id(shipmentId).optional().orElse(null);
                if (shipment == null) return ResponseEntity.status(404).body(Map.of("error", "shipment not found"));
                com.donilogistics.entity.Address pickup = shipment.getPickupAddress();
                com.donilogistics.entity.Address delivery = shipment.getDeliveryAddress();
                if (pickup == null || pickup.getLatitude() == null || pickup.getLongitude() == null
                        || delivery == null || delivery.getLatitude() == null || delivery.getLongitude() == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "shipment addresses lack coordinates"));
                }
                com.donilogistics.entity.DriverProfile d = null;
                if (driverProfileId != null) {
                    d = dataManager.load(com.donilogistics.entity.DriverProfile.class).id(driverProfileId).optional().orElse(null);
                }
                List<com.donilogistics.service.GraphHopperService.LatLon> pts = new ArrayList<>();
                if (d != null && d.getCurrentLatitude() != null && d.getCurrentLongitude() != null) {
                    pts.add(new GraphHopperService.LatLon(d.getCurrentLatitude(), d.getCurrentLongitude()));
                }
                pts.add(new GraphHopperService.LatLon(pickup.getLatitude(), pickup.getLongitude()));
                pts.add(new GraphHopperService.LatLon(delivery.getLatitude(), delivery.getLongitude()));
                List<double[]> geom = graphHopperService.getRouteGeometry(pts);
                return ResponseEntity.ok(Map.of("geometry", geom));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        });
    }

    @PostMapping(value = "/route-plans/{id}/broadcast", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> broadcastRoutePlan(@RequestHeader(value = "Authorization", required = false) String auth,
                                                @PathVariable("id") UUID id,
                                                @RequestBody(required = false) Map<String, Object> body) {
        if (!isDevAdmin(auth)) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        return systemAuthenticator.withSystem(() -> {
            com.donilogistics.entity.RoutePlan plan = dataManager.load(com.donilogistics.entity.RoutePlan.class).id(id).optional().orElse(null);
            if (plan == null) return ResponseEntity.status(404).body(Map.of("error", "route plan not found"));
            List<com.donilogistics.entity.RouteStop> stops = dataManager.load(com.donilogistics.entity.RouteStop.class)
                    .query("select s from RouteStop s where s.routePlan.id = :pid order by s.sequenceNo asc")
                    .parameter("pid", id)
                    .list();
            if (stops.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "no stops in route"));
            // Origin point is the first stop
            java.math.BigDecimal oLat = stops.get(0).getLat();
            java.math.BigDecimal oLon = stops.get(0).getLon();
            if (oLat == null || oLon == null) return ResponseEntity.badRequest().body(Map.of("error", "origin has no coordinates"));

            String audience = body != null ? Objects.toString(body.getOrDefault("audience", "both"), "both") : "both";
            int limit = 5;
            if (body != null && body.get("limit") != null) {
                try { limit = Math.max(1, Integer.parseInt(Objects.toString(body.get("limit")))); } catch (Exception ignored) {}
            }

            List<Map<String, Object>> notified = new ArrayList<>();

            if (audience.equalsIgnoreCase("both") || audience.equalsIgnoreCase("drivers")) {
                // Find nearest drivers
                List<com.donilogistics.entity.DriverProfile> drivers = dataManager.load(com.donilogistics.entity.DriverProfile.class).all().list();
                List<com.donilogistics.entity.DriverProfile> eligible = new ArrayList<>();
                for (var d : drivers) {
                    if (d.getActive() != null && d.getActive() && d.getCurrentLatitude() != null && d.getCurrentLongitude() != null && d.getUser() != null) {
                        eligible.add(d);
                    }
                }
                eligible.sort((a, b) -> Double.compare(
                        haversine(oLat.doubleValue(), oLon.doubleValue(), a.getCurrentLatitude().doubleValue(), a.getCurrentLongitude().doubleValue()),
                        haversine(oLat.doubleValue(), oLon.doubleValue(), b.getCurrentLatitude().doubleValue(), b.getCurrentLongitude().doubleValue())
                ));
                int count = Math.min(limit, eligible.size());
                for (int i = 0; i < count; i++) {
                    var d = eligible.get(i);
                    try {
                        UUID notifId = notificationService.notifyUser(
                                d.getUser().getId(),
                                "New route opportunity",
                                "Route " + plan.getName() + " starting near you. Plan ID: " + plan.getId(),
                                com.donilogistics.entity.NotificationType.DRIVER_ASSIGNMENT,
                                com.donilogistics.entity.NotificationChannel.IN_APP,
                                null,
                                null
                        );
                        notified.add(Map.of(
                                "type", "driver",
                                "driverId", d.getId(),
                                "userId", d.getUser().getId(),
                                "notificationId", notifId
                        ));
                    } catch (Exception ignored) {}
                }
            }

            if (audience.equalsIgnoreCase("both") || audience.equalsIgnoreCase("vehicles")) {
                // Find nearest vehicles (optionally notify assigned drivers)
                List<com.donilogistics.entity.Vehicle> vehicles = dataManager.load(com.donilogistics.entity.Vehicle.class).all().list();
                vehicles.sort((a, b) -> Double.compare(
                        haversine(oLat.doubleValue(), oLon.doubleValue(), a.getCurrentLatitude() != null ? a.getCurrentLatitude() : 0.0, a.getCurrentLongitude() != null ? a.getCurrentLongitude() : 0.0),
                        haversine(oLat.doubleValue(), oLon.doubleValue(), b.getCurrentLatitude() != null ? b.getCurrentLatitude() : 0.0, b.getCurrentLongitude() != null ? b.getCurrentLongitude() : 0.0)
                ));
                int sent = 0;
                for (var v : vehicles) {
                    if (v.getAssignedDriver() != null && v.getCurrentLatitude() != null && v.getCurrentLongitude() != null) {
                        try {
                            UUID notifId = notificationService.notifyUser(
                                    v.getAssignedDriver().getId(),
                                    "Vehicle nearby route",
                                    "Route " + plan.getName() + " near vehicle " + v.getLicensePlate() + ". Plan ID: " + plan.getId(),
                                    com.donilogistics.entity.NotificationType.DRIVER_ASSIGNMENT,
                                    com.donilogistics.entity.NotificationChannel.IN_APP,
                                    null,
                                    null
                            );
                            notified.add(Map.of(
                                    "type", "vehicle",
                                    "vehicleId", v.getId(),
                                    "assignedDriverId", v.getAssignedDriver().getId(),
                                    "notificationId", notifId
                            ));
                            sent++;
                            if (sent >= limit) break;
                        } catch (Exception ignored) {}
                    }
                }
            }

            return ResponseEntity.ok(Map.of("sent", notified.size(), "details", notified));
        });
    }

    private static double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371e3;
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double dphi = Math.toRadians(lat2 - lat1);
        double dlambda = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dphi / 2) * Math.sin(dphi / 2)
                + Math.cos(phi1) * Math.cos(phi2)
                * Math.sin(dlambda / 2) * Math.sin(dlambda / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}


