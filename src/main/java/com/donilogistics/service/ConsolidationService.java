package com.donilogistics.service;

import com.donilogistics.entity.*;
import io.jmix.core.DataManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ConsolidationService {

    private static final Logger log = LoggerFactory.getLogger(ConsolidationService.class);

    private final DataManager dataManager;
    private final GraphHopperService graphHopperService;

    public ConsolidationService(DataManager dataManager, GraphHopperService graphHopperService) {
        this.dataManager = dataManager;
        this.graphHopperService = graphHopperService;
    }

    public UUID createConsolidationAndPlanRoute(UUID originAddressId, UUID destAddressId, List<UUID> shipmentIds, UUID vehicleId, UUID driverId, UUID organizationId) {
        Address origin = originAddressId != null ? dataManager.load(Address.class).id(originAddressId).one() : null;
        Address dest = destAddressId != null ? dataManager.load(Address.class).id(destAddressId).one() : null;
        Vehicle vehicle = vehicleId != null ? dataManager.load(Vehicle.class).id(vehicleId).one() : null;
        DriverProfile driver = driverId != null ? dataManager.load(DriverProfile.class).id(driverId).one() : null;

        Consolidation cons = dataManager.create(Consolidation.class);
        cons.setStatus(ConsolidationStatus.OPEN);
        cons.setOriginWarehouse(origin);
        cons.setDestWarehouse(dest);
        if (organizationId != null) {
            Organization org = dataManager.load(Organization.class).id(organizationId).one();
            cons.setOrganization(org);
        }
        cons = dataManager.save(cons);

        // Attach shipments
        List<Shipment> shipments = new ArrayList<>();
        if (shipmentIds != null) {
            for (UUID sid : shipmentIds) {
                try {
                    Shipment s = dataManager.load(Shipment.class).id(sid).one();
                    shipments.add(s);
                    ConsolidationItem item = dataManager.create(ConsolidationItem.class);
                    item.setConsolidation(cons);
                    item.setShipment(s);
                    dataManager.save(item);
                } catch (Exception ignored) {}
            }
        }

        // Build route plan points: origin -> all shipment deliveries -> dest
        List<GraphHopperService.LatLon> points = new ArrayList<>();
        List<Shipment> pointShipments = new ArrayList<>(); // parallel to points list
        boolean hasOrigin = origin != null && origin.getLatitude() != null && origin.getLongitude() != null;
        if (hasOrigin) {
            points.add(new GraphHopperService.LatLon(origin.getLatitude(), origin.getLongitude()));
            pointShipments.add(null);
        }
        for (Shipment s : shipments) {
            Address a = s.getDeliveryAddress();
            if (a != null && a.getLatitude() != null && a.getLongitude() != null) {
                points.add(new GraphHopperService.LatLon(a.getLatitude(), a.getLongitude()));
                pointShipments.add(s);
            }
        }
        boolean hasDest = dest != null && dest.getLatitude() != null && dest.getLongitude() != null;
        if (hasDest) {
            points.add(new GraphHopperService.LatLon(dest.getLatitude(), dest.getLongitude()));
            pointShipments.add(null);
        }

        Map<String, Object> matrix = Collections.emptyMap();
        try {
            if (points.size() >= 2) {
                matrix = graphHopperService.getMatrix(points);
            }
        } catch (Exception e) {
            log.warn("GraphHopper matrix failed: {}", e.getMessage());
        }

        // Simple nearest-neighbor heuristic to order stops (respect free API)
        List<Integer> order = new ArrayList<>();
        for (int i = 0; i < points.size(); i++) order.add(i);
        if (points.size() > 2) order = nearestNeighborOrder(points);

        RoutePlan plan = dataManager.create(RoutePlan.class);
        plan.setName("Consolidation " + cons.getId());
        plan.setVehicle(vehicle);
        plan.setDriver(driver);
        plan.setRouteStatus(RouteStatus.PLANNED);
        // Persist plan FIRST so children can reference a managed entity
        plan = dataManager.save(plan);
        List<Map<String, Object>> stopsJson = new ArrayList<>();
        int seq = 0;
        for (Integer idx : order) {
            GraphHopperService.LatLon p = points.get(idx);
            RouteStop stop = dataManager.create(RouteStop.class);
            stop.setRoutePlan(plan);
            stop.setSequenceNo(seq++);
            stop.setLat(p.lat);
            stop.setLon(p.lon);
            if (idx == 0 && hasOrigin) {
                stop.setStopType(RouteStopType.ORIGIN);
            } else if (idx == points.size() - 1 && hasDest) {
                stop.setStopType(RouteStopType.DESTINATION);
            } else {
                stop.setStopType(RouteStopType.DELIVERY);
            }
            // Link shipment if this stop corresponds to a shipment
            Shipment linked = pointShipments.get(idx);
            if (linked != null) {
                stop.setShipment(linked);
            }
            dataManager.save(stop);
            Map<String, Object> j = new LinkedHashMap<>();
            j.put("lat", p.lat);
            j.put("lon", p.lon);
            j.put("sequence", stop.getSequenceNo());
            stopsJson.add(j);
        }
        plan.setStops(toJson(stopsJson));
        // Attach matrix and geometry for nicer visualization
        try {
            List<double[]> geometry = graphHopperService.getRouteGeometry(points);
            if (geometry != null && !geometry.isEmpty()) {
                List<Map<String, Object>> geom = new ArrayList<>();
                for (double[] g : geometry) {
                    Map<String, Object> pt = new LinkedHashMap<>();
                    pt.put("lat", g[0]);
                    pt.put("lon", g[1]);
                    geom.add(pt);
                }
                Map<String, Object> meta = new LinkedHashMap<>();
                if (matrix != null) meta.put("matrix", matrix);
                meta.put("geometry", geom);
                plan.setSolverMeta(toJson(meta));
            } else {
                plan.setSolverMeta(matrix != null ? toJson(matrix) : null);
            }
        } catch (Exception e) {
            log.warn("Failed to fetch route geometry: {}", e.getMessage());
            plan.setSolverMeta(matrix != null ? toJson(matrix) : null);
        }
        plan = dataManager.save(plan);

        return plan.getId();
    }

    private String toJson(Object obj) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            return null;
        }
    }

    private List<Integer> nearestNeighborOrder(List<GraphHopperService.LatLon> points) {
        int n = points.size();
        boolean[] visited = new boolean[n];
        List<Integer> route = new ArrayList<>();
        int current = 0; // start at origin
        route.add(current);
        visited[current] = true;
        for (int step = 1; step < n; step++) {
            int next = -1;
            double best = Double.MAX_VALUE;
            for (int j = 0; j < n; j++) {
                if (!visited[j]) {
                    double d = haversine(points.get(current), points.get(j));
                    if (d < best) { best = d; next = j; }
                }
            }
            if (next == -1) break;
            visited[next] = true;
            route.add(next);
            current = next;
        }
        return route;
    }

    private double haversine(GraphHopperService.LatLon a, GraphHopperService.LatLon b) {
        double R = 6371e3; // meters
        double phi1 = Math.toRadians(a.lat.doubleValue());
        double phi2 = Math.toRadians(b.lat.doubleValue());
        double dphi = Math.toRadians(b.lat.doubleValue() - a.lat.doubleValue());
        double dlambda = Math.toRadians(b.lon.doubleValue() - a.lon.doubleValue());
        double sa = Math.sin(dphi/2) * Math.sin(dphi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda/2) * Math.sin(dlambda/2);
        double c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1-sa));
        return R * c;
    }
}


