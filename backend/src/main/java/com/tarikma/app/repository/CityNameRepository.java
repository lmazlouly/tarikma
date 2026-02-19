package com.tarikma.app.repository;

import com.tarikma.app.entity.CityName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CityNameRepository extends JpaRepository<CityName, Long> {

    List<CityName> findByCityId(Long cityId);

    Optional<CityName> findByCityIdAndLanguageCode(Long cityId, String languageCode);

    boolean existsByCityIdAndLanguageCode(Long cityId, String languageCode);
}
