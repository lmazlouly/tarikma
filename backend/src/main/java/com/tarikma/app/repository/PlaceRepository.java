package com.tarikma.app.repository;

import com.tarikma.app.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    List<Place> findByCityId(Long cityId);

    List<Place> findByCategory(String category);

    List<Place> findByCityIdAndCategory(Long cityId, String category);
}
