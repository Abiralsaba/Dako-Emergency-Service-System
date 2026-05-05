package com.serds.strategy;

import com.serds.entity.EmergencyRequest;
import com.serds.entity.Responder;

import java.util.List;

// Strategy interface — lets us swap dispatch algorithms at runtime (AOOP polymorphism)
public interface DispatchStrategy {
    Responder findBestResponder(EmergencyRequest request, List<Responder> available);
}
