package com.serds.strategy;

import com.serds.entity.EmergencyRequest;
import com.serds.entity.Responder;

import java.util.List;

/**
 * Strategy Pattern Interface — Dispatch Algorithm Contract.
 *
 * This is the core abstraction of the Strategy Pattern (AOOP concept).
 * Any class that implements this interface can serve as a dispatch algorithm
 * in the DispatchEngine. The engine doesn't know or care which concrete
 * strategy is active — it just calls findBestResponder() and trusts
 * the polymorphic dispatch to do the right thing.
 *
 * Current implementations:
 *   - NearestResponderStrategy: picks the geographically closest responder (primary)
 *   - RoundRobinStrategy: cycles through responders evenly (fallback)
 *
 * To add a new strategy (e.g. PriorityBasedStrategy):
 *   1. Create a new class that implements this interface
 *   2. Annotate it with @Component so Spring picks it up
 *   3. Inject it into DispatchEngine and call setStrategy() when needed
 *   — No changes to DispatchEngine code required (Open/Closed Principle)
 */
public interface DispatchStrategy {

    /**
     * Finds the best responder from a pool of available candidates.
     *
     * @param request   the emergency request containing location, type, and severity info
     * @param available pre-filtered list of responders who are online, approved, and within radius
     * @return the single best responder according to this strategy, or null if no suitable match
     */
    Responder findBestResponder(EmergencyRequest request, List<Responder> available);
}
