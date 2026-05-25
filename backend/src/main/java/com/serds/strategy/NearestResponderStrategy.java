package com.serds.strategy;

import com.serds.entity.EmergencyRequest;
import com.serds.entity.Responder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * PRIMARY Dispatch Strategy — Nearest Responder First.
 *
 * This is the default algorithm used by the DispatchEngine. It calculates
 * the geographic distance (using the Haversine formula) between the emergency
 * location and each available responder, then picks the closest one.
 *
 * Why nearest-first makes sense for Bangladesh:
 *   - Dense urban areas like Dhaka have heavy traffic, so even small
 *     distance differences can mean minutes of difference in response time
 *   - Rural districts may have only a few responders, so the nearest one
 *     is often the only realistic option
 *   - The 999 hotline standard expects sub-4-minute response targets
 *
 * Implements the Strategy interface so the DispatchEngine can swap
 * algorithms at runtime (Strategy Pattern — AOOP polymorphism).
 */
@Component
public class NearestResponderStrategy implements DispatchStrategy {

    /**
     * Finds the single best responder from the available pool.
     *
     * Algorithm:
     * 1. Iterate through all available responders
     * 2. Skip any without GPS coordinates (they can't be distance-ranked)
     * 3. Calculate Haversine distance from emergency to each responder
     * 4. Return the one with the smallest distance
     * 5. If nobody has GPS, fall back to the first in the list (database order)
     *
     * @param request   the emergency that needs a responder
     * @param available list of responders who are online, approved, and within radius
     * @return the nearest responder, or the first available as a fallback
     */
    @Override
    public Responder findBestResponder(EmergencyRequest request, List<Responder> available) {
        if (available.isEmpty()) return null;

        Responder nearest = null;
        double minDistance = Double.MAX_VALUE;

        for (Responder r : available) {
            // Skip responders without GPS data — we can't calculate distance
            if (r.getLatitude() == null || r.getLongitude() == null) continue;

            // Haversine gives us the straight-line distance in km
            double dist = haversine(
                request.getLatitude(), request.getLongitude(),
                r.getLatitude(), r.getLongitude()
            );

            // Track the closest responder seen so far
            if (dist < minDistance) {
                minDistance = dist;
                nearest = r;
            }
        }

        // Fallback: if no responder has GPS coordinates, just pick the first one
        // (better to send someone than no one in an emergency)
        return nearest != null ? nearest : available.get(0);
    }

    /**
     * Haversine formula — calculates the great-circle distance between
     * two points on Earth given their latitude and longitude in degrees.
     *
     * This is the same formula used by Google Maps for "as the crow flies"
     * distances. It accounts for Earth's curvature, which matters for
     * distances beyond a few kilometers.
     *
     * @return distance in kilometers
     */
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
