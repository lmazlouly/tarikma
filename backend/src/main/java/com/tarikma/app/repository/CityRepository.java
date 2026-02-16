package com.tarikma.app.repository;

import com.tarikma.app.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {

    List<City> findByRegion(String region);
}
