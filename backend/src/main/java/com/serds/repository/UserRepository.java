package com.serds.repository;

import com.serds.entity.BaseUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<BaseUser, Long> {
    Optional<BaseUser> findByNid(String nid);
    Optional<BaseUser> findByPhoneNumber(String phoneNumber);
    boolean existsByNid(String nid);
    boolean existsByPhoneNumber(String phoneNumber);
}
