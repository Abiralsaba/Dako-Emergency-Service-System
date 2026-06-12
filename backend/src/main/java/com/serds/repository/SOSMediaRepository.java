package com.serds.repository;

import com.serds.entity.SOSMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOSMediaRepository extends JpaRepository<SOSMedia, Long> {
    List<SOSMedia> findByRequestId(Long requestId);
}
