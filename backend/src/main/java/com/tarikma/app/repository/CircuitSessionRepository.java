package com.tarikma.app.repository;

import com.tarikma.app.entity.CircuitSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CircuitSessionRepository extends JpaRepository<CircuitSession, Long> {

    List<CircuitSession> findByCircuitIdOrderByStartDateTimeAsc(Long circuitId);
}
