package com.tarikma.app.repository;

import com.tarikma.app.entity.Circuit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CircuitRepository extends JpaRepository<Circuit, Long> {

    List<Circuit> findByCreatedById(Long createdById);

    List<Circuit> findByCreatedByIdAndCityId(Long createdById, Long cityId);

    @Query("""
        SELECT DISTINCT c FROM Circuit c
        JOIN CircuitSession s ON s.circuit = c
        WHERE c.priceMad IS NOT NULL
          AND s.status = 'SCHEDULED'
          AND s.startDateTime > CURRENT_TIMESTAMP
        """)
    List<Circuit> findPublishedTours();

    @Query("""
        SELECT DISTINCT c FROM Circuit c
        JOIN CircuitSession s ON s.circuit = c
        WHERE c.priceMad IS NOT NULL
          AND c.city.id = :cityId
          AND s.status = 'SCHEDULED'
          AND s.startDateTime > CURRENT_TIMESTAMP
        """)
    List<Circuit> findPublishedToursByCityId(Long cityId);
}
