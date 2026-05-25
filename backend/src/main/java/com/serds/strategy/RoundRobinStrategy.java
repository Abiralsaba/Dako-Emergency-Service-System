package com.serds.strategy;

import com.serds.entity.EmergencyRequest;
import com.serds.entity.Responder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * FALLBACK Dispatch Strategy — Round Robin Distribution.
 *
 * This strategy cycles through available responders in a rotating sequence,
 * ensuring that no single responder gets overloaded while others sit idle.
 * It's used as a fallback when GPS data is unavailable or when the primary
 * NearestResponderStrategy can't determine distances.
 *
 * How it works:
 *   - Maintains a thread-safe counter (AtomicInteger) that increments with each dispatch
 *   - Uses modulo arithmetic to wrap around the list of available responders
 *   - Each new emergency gets the "next" responder in the rotation
 *
 * When this strategy is useful:
 *   - During system startup when GPS hasn't been acquired yet
 *   - In areas with poor GPS signal (e.g. dense urban canyons in old Dhaka)
 *   - When an admin wants to distribute workload evenly during peak hours
 *   - As a fallback when the primary strategy returns null
 *
 * AOOP Concept: This demonstrates the Strategy Pattern — same interface
 * (DispatchStrategy), completely different algorithm. The DispatchEngine
 * doesn't need to know which strategy is active; it just calls
 * findBestResponder() and gets the right behavior.
 */
@Component
public class RoundRobinStrategy implements DispatchStrategy {

    /**
     * Thread-safe counter that tracks the current position in the rotation.
     * Using AtomicInteger because multiple emergency requests could be
     * dispatched concurrently from different threads.
     */
    private final AtomicInteger counter = new AtomicInteger(0);

    /**
     * Picks the next responder in the round-robin rotation.
     *
     * The counter continuously increments, and we use modulo (%) to
     * wrap it around the size of the available list. This ensures:
     *   - Responder A gets request 1, B gets request 2, C gets request 3
     *   - Then back to A for request 4, and so on
     *   - Fair distribution regardless of how many requests come in
     *
     * @param request   the emergency (not used for selection in round-robin,
     *                  but required by the Strategy interface contract)
     * @param available list of responders who are online and approved
     * @return the next responder in the rotation, or null if list is empty
     */
    @Override
    public Responder findBestResponder(EmergencyRequest request, List<Responder> available) {
        if (available.isEmpty()) return null;

        // getAndIncrement is atomic — safe for concurrent dispatch calls
        int index = counter.getAndIncrement() % available.size();
        return available.get(index);
    }
}
