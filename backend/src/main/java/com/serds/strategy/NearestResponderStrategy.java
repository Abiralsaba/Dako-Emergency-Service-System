package com.serds.strategy;

import com.serds.entity.EmergencyRequest;
import com.serds.entity.Responder;
import org.springframework.stereotype.Component;

import java.util.List;

// Primary dispatch algorithm — finds the geographically closest responder
@Component
public class NearestResponderStrategy implements DispatchStrategy {

    @Override
    public Responder findBestResponder(EmergencyRequest request, List<Responder> available) {
        if (available.isEmpty()) return null;

        Responder nearest = null;
        double minDistance = Double.MAX_VALUE;

        for (Responder r : available) {
            // Skip responders without GPS data
            if (r.getLatitude() == null || r.getLongitude() == null) continue;

            double dist = haversine(
                request.getLatitude(), request.getLongitude(),
                r.getLatitude(), r.getLongitude()
            );

            if (dist < minDistance) {
                minDistance = dist;
                nearest = r;
            }
        }

        // Fallback: if no one has GPS, just pick the first available
        return nearest != null ? nearest : available.get(0);
    }

    // Haversine formula — calculates distance between two GPS coordinates in km
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
