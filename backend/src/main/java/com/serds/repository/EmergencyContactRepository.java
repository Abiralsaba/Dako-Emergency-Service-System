package com.serds.repository;

import com.serds.entity.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByCitizenId(Long citizenId);
    List<EmergencyContact> findByCitizenIdAndIsPrimaryTrue(Long citizenId);
}
