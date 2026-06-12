package com.serds.service;

import com.serds.entity.Station;
import com.serds.entity.Zone;
import com.serds.enums.StationType;
import com.serds.exception.ResourceNotFoundException;
import com.serds.repository.StationRepository;
import com.serds.repository.ZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Manages stations and zones — the physical infrastructure of the dispatch network
@Service
@Transactional
public class StationService {

    private final StationRepository stationRepo;
    private final ZoneRepository zoneRepo;

    public StationService(StationRepository stationRepo, ZoneRepository zoneRepo) {
        this.stationRepo = stationRepo;
        this.zoneRepo = zoneRepo;
    }

    // --- Zone operations ---

    public Zone createZone(Zone zone) {
        return zoneRepo.save(zone);
    }

    public List<Zone> getAllZones() {
        return zoneRepo.findAll();
    }

    public List<Zone> getActiveZones() {
        return zoneRepo.findByIsActiveTrue();
    }

    public Zone getZoneById(Long id) {
        return zoneRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Zone #" + id + " not found"));
    }

    public Zone updateZone(Long id, Zone updates) {
        Zone zone = getZoneById(id);
        if (updates.getName() != null) zone.setName(updates.getName());
        if (updates.getDescription() != null) zone.setDescription(updates.getDescription());
        if (updates.getBoundaryNorthLat() != null) zone.setBoundaryNorthLat(updates.getBoundaryNorthLat());
        if (updates.getBoundarySouthLat() != null) zone.setBoundarySouthLat(updates.getBoundarySouthLat());
        if (updates.getBoundaryEastLng() != null) zone.setBoundaryEastLng(updates.getBoundaryEastLng());
        if (updates.getBoundaryWestLng() != null) zone.setBoundaryWestLng(updates.getBoundaryWestLng());
        if (updates.getIsActive() != null) zone.setIsActive(updates.getIsActive());
        return zoneRepo.save(zone);
    }

    // --- Station operations ---

    public Station createStation(Station station) {
        return stationRepo.save(station);
    }

    public List<Station> getAllStations() {
        return stationRepo.findAll();
    }

    public List<Station> getOperationalStations() {
        return stationRepo.findByIsOperationalTrue();
    }

    public List<Station> getStationsByType(StationType type) {
        return stationRepo.findByStationTypeAndIsOperationalTrue(type);
    }

    public List<Station> getStationsByZone(Long zoneId) {
        return stationRepo.findByZoneId(zoneId);
    }

    public Station getStationById(Long id) {
        return stationRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Station #" + id + " not found"));
    }

    public Station updateStation(Long id, Station updates) {
        Station station = getStationById(id);
        if (updates.getName() != null) station.setName(updates.getName());
        if (updates.getAddress() != null) station.setAddress(updates.getAddress());
        if (updates.getPhoneNumber() != null) station.setPhoneNumber(updates.getPhoneNumber());
        if (updates.getCapacity() != null) station.setCapacity(updates.getCapacity());
        if (updates.getIsOperational() != null) station.setIsOperational(updates.getIsOperational());
        if (updates.getLatitude() != null) station.setLatitude(updates.getLatitude());
        if (updates.getLongitude() != null) station.setLongitude(updates.getLongitude());
        return stationRepo.save(station);
    }

    // Assign a station to a zone
    public Station assignToZone(Long stationId, Long zoneId) {
        Station station = getStationById(stationId);
        Zone zone = getZoneById(zoneId);
        station.setZone(zone);
        return stationRepo.save(station);
    }
}
