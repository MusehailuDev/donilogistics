package com.donilogistics.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Service
public class GraphHopperService {
    private static final Logger log = LoggerFactory.getLogger(GraphHopperService.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${graphhopper.api.key:}")
    private String apiKey;

    // Simple in-memory cache to avoid repeat calls within a short window
    private final Map<String, Object> cache = new LinkedHashMap<String, Object>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Object> eldest) {
            return this.size() > 100; // cap cache size
        }
    };

    public static class LatLon {
        public final BigDecimal lat;
        public final BigDecimal lon;
        public LatLon(BigDecimal lat, BigDecimal lon) { this.lat = lat; this.lon = lon; }
    }

    public Map<String, Object> getMatrix(List<LatLon> points) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GraphHopper API key is not configured");
        }
        // Respect free tier: limit points aggressively
        if (points.size() > 5) {
            points = points.subList(0, 5);
        }
        String cacheKey = "matrix:" + points.toString();
        if (cache.containsKey(cacheKey)) {
            return (Map<String, Object>) cache.get(cacheKey);
        }

        String url = "https://graphhopper.com/api/1/matrix?key=" + apiKey;
        Map<String, Object> payload = new HashMap<>();
        List<List<Double>> pts = new ArrayList<>();
        for (LatLon p : points) {
            if (p == null || p.lat == null || p.lon == null) continue;
            // GraphHopper Matrix expects [lat, lon]
            pts.add(Arrays.asList(p.lat.doubleValue(), p.lon.doubleValue()));
        }
        if (pts.size() < 2) {
            throw new IllegalArgumentException("Not enough valid coordinates for matrix (need >= 2)");
        }
        payload.put("points", pts);
        payload.put("out_arrays", Arrays.asList("times", "distances"));
        payload.put("vehicle", "car");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> body = response.getBody();
            cache.put(cacheKey, body);
            return body;
        } catch (Exception e) {
            log.error("GraphHopper matrix call failed", e);
            throw new RuntimeException("GraphHopper matrix call failed: " + e.getMessage());
        }
    }

    public List<double[]> getRouteGeometry(List<LatLon> points) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GraphHopper API key is not configured");
        }
        if (points == null || points.size() < 2) {
            throw new IllegalArgumentException("Not enough points to build route (need >= 2)");
        }
        // Limit number of points for free plan safety
        if (points.size() > 15) {
            points = points.subList(0, 15);
        }

        StringBuilder url = new StringBuilder("https://graphhopper.com/api/1/route?points_encoded=false&vehicle=car&locale=en&calc_points=true&key=")
                .append(apiKey);
        for (LatLon p : points) {
            if (p != null && p.lat != null && p.lon != null) {
                url.append("&point=").append(p.lat.doubleValue()).append(",").append(p.lon.doubleValue());
            }
        }
        try {
            ResponseEntity<Map> response = restTemplate.exchange(url.toString(), HttpMethod.GET, new HttpEntity<>(new HttpHeaders()), Map.class);
            Map body = response.getBody();
            if (body == null) return List.of();
            Object pathsObj = body.get("paths");
            if (!(pathsObj instanceof List) || ((List<?>) pathsObj).isEmpty()) return List.of();
            Object firstPath = ((List<?>) pathsObj).get(0);
            if (!(firstPath instanceof Map)) return List.of();
            Object pointsObj = ((Map<?, ?>) firstPath).get("points");
            if (!(pointsObj instanceof Map)) return List.of();
            Object coordsObj = ((Map<?, ?>) pointsObj).get("coordinates");
            if (!(coordsObj instanceof List)) return List.of();
            List<?> coords = (List<?>) coordsObj;
            List<double[]> result = new java.util.ArrayList<>();
            for (Object c : coords) {
                if (c instanceof List && ((List<?>) c).size() >= 2) {
                    // GraphHopper returns [lon, lat]
                    double lon = Double.parseDouble(Objects.toString(((List<?>) c).get(0)));
                    double lat = Double.parseDouble(Objects.toString(((List<?>) c).get(1)));
                    result.add(new double[]{lat, lon});
                }
            }
            return result;
        } catch (Exception e) {
            log.error("GraphHopper route call failed", e);
            throw new RuntimeException("GraphHopper route call failed: " + e.getMessage());
        }
    }
}








