package com.serds.repository;

import com.serds.entity.Station;
import com.serds.enums.StationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    List<Station> findByZoneId(Long zoneId);
    List<Station> findByStationType(StationType stationType);
    List<Station> findByIsOperationalTrue();
    List<Station> findByStationTypeAndIsOperationalTrue(StationType stationType);
}
