package com.tarikma.app.service;

import com.tarikma.app.dto.city.*;
import com.tarikma.app.entity.City;
import com.tarikma.app.entity.CityName;
import com.tarikma.app.entity.Place;
import com.tarikma.app.entity.User;
import com.tarikma.app.exception.BadRequestException;
import com.tarikma.app.exception.NotFoundException;
import com.tarikma.app.repository.CityNameRepository;
import com.tarikma.app.repository.CityRepository;
import com.tarikma.app.repository.PlaceRepository;
import com.tarikma.app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CityService {

    private final CityRepository cityRepository;
    private final CityNameRepository cityNameRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    public CityService(
            CityRepository cityRepository,
            CityNameRepository cityNameRepository,
            PlaceRepository placeRepository,
            UserRepository userRepository
    ) {
        this.cityRepository = cityRepository;
        this.cityNameRepository = cityNameRepository;
        this.placeRepository = placeRepository;
        this.userRepository = userRepository;
    }

    // ── Cities (read) ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CityResponse> listCities() {
        return cityRepository.findAll().stream().map(this::toCityResponse).toList();
    }

    @Transactional(readOnly = true)
    public CityResponse getCity(Long id) {
        return toCityResponse(findCityOrThrow(id));
    }

    // ── Cities (admin write) ────────────────────────────────────

    @Transactional
    public CityResponse createCity(CreateCityRequest req, String adminEmail) {
        User admin = findUserByEmailOrThrow(adminEmail);

        City city = new City();
        city.setRegion(req.getRegion().trim());
        city.setImage(req.getImage());
        city.setDescription(req.getDescription());
        city.setLatitude(req.getLatitude());
        city.setLongitude(req.getLongitude());
        city.setCreatedBy(admin);

        city = cityRepository.save(city);

        for (CityNameRequest nameReq : req.getNames()) {
            CityName cn = new CityName();
            cn.setCity(city);
            cn.setLanguageCode(nameReq.getLanguageCode().trim().toLowerCase());
            cn.setName(nameReq.getName().trim());
            cn.setPrimary(nameReq.isPrimary());
            cityNameRepository.save(cn);
        }

        return toCityResponse(cityRepository.findById(city.getId()).orElseThrow());
    }

    @Transactional
    public CityResponse updateCity(Long id, UpdateCityRequest req) {
        City city = findCityOrThrow(id);
        if (req.getRegion() != null) city.setRegion(req.getRegion().trim());
        if (req.getImage() != null) city.setImage(req.getImage());
        if (req.getDescription() != null) city.setDescription(req.getDescription());
        if (req.getLatitude() != null) city.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) city.setLongitude(req.getLongitude());
        return toCityResponse(cityRepository.save(city));
    }

    @Transactional
    public void deleteCity(Long id) {
        if (!cityRepository.existsById(id)) throw new NotFoundException("City not found");
        cityRepository.deleteById(id);
    }

    // ── City Names ──────────────────────────────────────────────

    @Transactional
    public CityNameResponse addCityName(Long cityId, CityNameRequest req) {
        City city = findCityOrThrow(cityId);
        String langCode = req.getLanguageCode().trim().toLowerCase();

        if (cityNameRepository.existsByCityIdAndLanguageCode(cityId, langCode)) {
            throw new BadRequestException("City name for language '" + langCode + "' already exists");
        }

        CityName cn = new CityName();
        cn.setCity(city);
        cn.setLanguageCode(langCode);
        cn.setName(req.getName().trim());
        cn.setPrimary(req.isPrimary());
        cn = cityNameRepository.save(cn);
        return toCityNameResponse(cn);
    }

    @Transactional
    public CityNameResponse updateCityName(Long cityId, Long nameId, CityNameRequest req) {
        findCityOrThrow(cityId);
        CityName cn = cityNameRepository.findById(nameId)
                .orElseThrow(() -> new NotFoundException("City name not found"));
        if (!cn.getCity().getId().equals(cityId)) {
            throw new BadRequestException("City name does not belong to this city");
        }

        String langCode = req.getLanguageCode().trim().toLowerCase();
        if (!cn.getLanguageCode().equals(langCode)
                && cityNameRepository.existsByCityIdAndLanguageCode(cityId, langCode)) {
            throw new BadRequestException("City name for language '" + langCode + "' already exists");
        }

        cn.setLanguageCode(langCode);
        cn.setName(req.getName().trim());
        cn.setPrimary(req.isPrimary());
        return toCityNameResponse(cityNameRepository.save(cn));
    }

    @Transactional
    public void deleteCityName(Long cityId, Long nameId) {
        CityName cn = cityNameRepository.findById(nameId)
                .orElseThrow(() -> new NotFoundException("City name not found"));
        if (!cn.getCity().getId().equals(cityId)) {
            throw new BadRequestException("City name does not belong to this city");
        }
        cityNameRepository.delete(cn);
    }

    // ── Places (read) ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PlaceResponse> listPlaces(Long cityId) {
        findCityOrThrow(cityId);
        return placeRepository.findByCityId(cityId).stream().map(this::toPlaceResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PlaceResponse> listAllPlaces() {
        return placeRepository.findAll().stream().map(this::toPlaceResponse).toList();
    }

    @Transactional(readOnly = true)
    public PlaceResponse getPlace(Long id) {
        return toPlaceResponse(findPlaceOrThrow(id));
    }

    // ── Places (write) ──────────────────────────────────────────

    @Transactional
    public PlaceResponse createPlace(CreatePlaceRequest req, String userEmail) {
        City city = findCityOrThrow(req.getCityId());
        User user = findUserByEmailOrThrow(userEmail);

        Place place = new Place();
        place.setCity(city);
        place.setName(req.getName().trim());
        place.setDescription(req.getDescription());
        place.setImage(req.getImage());
        place.setAddress(req.getAddress());
        place.setCategory(req.getCategory());
        place.setLatitude(req.getLatitude());
        place.setLongitude(req.getLongitude());
        place.setMapPlaceId(req.getMapPlaceId());
        place.setCreatedBy(user);

        return toPlaceResponse(placeRepository.save(place));
    }

    @Transactional
    public PlaceResponse updatePlace(Long id, UpdatePlaceRequest req) {
        Place place = findPlaceOrThrow(id);
        if (req.getName() != null) place.setName(req.getName().trim());
        if (req.getDescription() != null) place.setDescription(req.getDescription());
        if (req.getImage() != null) place.setImage(req.getImage());
        if (req.getAddress() != null) place.setAddress(req.getAddress());
        if (req.getCategory() != null) place.setCategory(req.getCategory());
        if (req.getLatitude() != null) place.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) place.setLongitude(req.getLongitude());
        if (req.getMapPlaceId() != null) place.setMapPlaceId(req.getMapPlaceId());
        return toPlaceResponse(placeRepository.save(place));
    }

    @Transactional
    public void deletePlace(Long id) {
        if (!placeRepository.existsById(id)) throw new NotFoundException("Place not found");
        placeRepository.deleteById(id);
    }

    // ── Mappers ─────────────────────────────────────────────────

    private CityResponse toCityResponse(City city) {
        CityResponse r = new CityResponse();
        r.setId(city.getId());
        r.setRegion(city.getRegion());
        r.setImage(city.getImage());
        r.setDescription(city.getDescription());
        r.setLatitude(city.getLatitude());
        r.setLongitude(city.getLongitude());
        r.setCreatedAt(city.getCreatedAt());
        r.setCreatedBy(city.getCreatedBy().getId());
        r.setNames(city.getNames().stream().map(this::toCityNameResponse).toList());
        r.setPlaceCount(city.getPlaces().size());
        return r;
    }

    private CityNameResponse toCityNameResponse(CityName cn) {
        return new CityNameResponse(cn.getId(), cn.getLanguageCode(), cn.getName(), cn.isPrimary());
    }

    private PlaceResponse toPlaceResponse(Place place) {
        PlaceResponse r = new PlaceResponse();
        r.setId(place.getId());
        r.setCityId(place.getCity().getId());
        r.setCityName(getPrimaryCityName(place.getCity()));
        r.setName(place.getName());
        r.setDescription(place.getDescription());
        r.setImage(place.getImage());
        r.setAddress(place.getAddress());
        r.setCategory(place.getCategory());
        r.setLatitude(place.getLatitude());
        r.setLongitude(place.getLongitude());
        r.setMapPlaceId(place.getMapPlaceId());
        r.setCreatedAt(place.getCreatedAt());
        r.setCreatedBy(place.getCreatedBy().getId());
        return r;
    }

    private String getPrimaryCityName(City city) {
        return city.getNames().stream()
                .filter(CityName::isPrimary)
                .findFirst()
                .map(CityName::getName)
                .orElse(city.getNames().isEmpty() ? null : city.getNames().getFirst().getName());
    }

    // ── Helpers ─────────────────────────────────────────────────

    private City findCityOrThrow(Long id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("City not found"));
    }

    private Place findPlaceOrThrow(Long id) {
        return placeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Place not found"));
    }

    private User findUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
