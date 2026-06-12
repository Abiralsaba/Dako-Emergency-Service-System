package com.serds.repository;

import com.serds.entity.HealthComplaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthComplaintRepository extends JpaRepository<HealthComplaint, Long> {
    List<HealthComplaint> findAllByCitizenIdOrderByCreatedAtDesc(Long citizenId);
}
