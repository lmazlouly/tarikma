package com.tarikma.app.repository;

import com.tarikma.app.entity.Circuit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CircuitRepository extends JpaRepository<Circuit, Long> {

    List<Circuit> findByCreatedById(Long createdById);

    List<Circuit> findByCreatedByIdAndCityId(Long createdById, Long cityId);
}
