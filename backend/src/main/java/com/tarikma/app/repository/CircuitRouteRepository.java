package com.tarikma.app.repository;

import com.tarikma.app.entity.CircuitRoute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CircuitRouteRepository extends JpaRepository<CircuitRoute, Long> {

    List<CircuitRoute> findByCircuitId(Long circuitId);

    Optional<CircuitRoute> findByCircuitIdAndFromStopIdAndToStopId(Long circuitId, Long fromStopId, Long toStopId);
}
