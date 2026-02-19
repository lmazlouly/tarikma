package com.tarikma.app.repository;

import com.tarikma.app.entity.CircuitStop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CircuitStopRepository extends JpaRepository<CircuitStop, Long> {

    List<CircuitStop> findByCircuitIdOrderByPositionAsc(Long circuitId);

    long countByCircuitId(Long circuitId);

    Optional<CircuitStop> findTopByCircuitIdOrderByPositionDesc(Long circuitId);

    boolean existsByCircuitIdAndPlaceId(Long circuitId, Long placeId);
}
