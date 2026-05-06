package com.serds.strategy;

import com.serds.entity.EmergencyRequest;
import com.serds.entity.Responder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

// Fallback strategy — cycles through responders when GPS isn't available
@Component
public class RoundRobinStrategy implements DispatchStrategy {

    private final AtomicInteger counter = new AtomicInteger(0);

    @Override
    public Responder findBestResponder(EmergencyRequest request, List<Responder> available) {
        if (available.isEmpty()) return null;

        int index = counter.getAndIncrement() % available.size();
        return available.get(index);
    }
}
