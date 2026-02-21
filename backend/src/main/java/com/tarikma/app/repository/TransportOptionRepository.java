package com.tarikma.app.repository;

import com.tarikma.app.entity.TransportOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransportOptionRepository extends JpaRepository<TransportOption, Long> {

    List<TransportOption> findByFromPlaceCityId(Long cityId);

    List<TransportOption> findByFromPlaceIdAndToPlaceId(Long fromPlaceId, Long toPlaceId);
}
