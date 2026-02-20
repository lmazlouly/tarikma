package com.tarikma.app.service;

import com.tarikma.app.dto.transport.CreateTransportOptionRequest;
import com.tarikma.app.dto.transport.TransportOptionResponse;
import com.tarikma.app.dto.transport.UpdateTransportOptionRequest;
import com.tarikma.app.entity.Place;
import com.tarikma.app.entity.TransportOption;
import com.tarikma.app.entity.User;
import com.tarikma.app.exception.BadRequestException;
import com.tarikma.app.exception.NotFoundException;
import com.tarikma.app.repository.PlaceRepository;
import com.tarikma.app.repository.TransportOptionRepository;
import com.tarikma.app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TransportOptionService {

    private final TransportOptionRepository transportOptionRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    public TransportOptionService(
            TransportOptionRepository transportOptionRepository,
            PlaceRepository placeRepository,
            UserRepository userRepository
    ) {
        this.transportOptionRepository = transportOptionRepository;
        this.placeRepository = placeRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TransportOptionResponse> list(Long cityId, Long fromPlaceId, Long toPlaceId) {
        List<TransportOption> options;

        if (fromPlaceId != null && toPlaceId != null) {
            options = listForPlaces(fromPlaceId, toPlaceId);
        } else if (cityId != null) {
            options = transportOptionRepository.findByFromPlaceCityId(cityId);
        } else {
            options = transportOptionRepository.findAll();
        }

        return options.stream()
                .sorted(Comparator.comparing(TransportOption::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TransportOptionResponse get(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public TransportOptionResponse create(CreateTransportOptionRequest req, String creatorEmail) {
        User creator = findUserByEmailOrThrow(creatorEmail);

        Place from = findPlaceOrThrow(req.getFromPlaceId());
        Place to = findPlaceOrThrow(req.getToPlaceId());

        if (from.getId().equals(to.getId())) {
            throw new BadRequestException("From and to places must be different");
        }

        TransportOption opt = new TransportOption();
        opt.setFromPlace(from);
        opt.setToPlace(to);
        opt.setMode(req.getMode().trim());
        opt.setName(req.getName());
        opt.setDescription(req.getDescription());
        opt.setBidirectional(req.isBidirectional());
        opt.setPricingType(normalizePricingType(req.getPricingType()));
        opt.setPriceMad(req.getPriceMad());
        opt.setPricePerKmMad(req.getPricePerKmMad());
        opt.setCurrency(req.getCurrency() == null || req.getCurrency().isBlank() ? "MAD" : req.getCurrency().trim().toUpperCase());
        opt.setServiceStartTime(req.getServiceStartTime());
        opt.setServiceEndTime(req.getServiceEndTime());
        opt.setDistanceKm(req.getDistanceKm());
        opt.setDurationMinutes(req.getDurationMinutes());
        opt.setCreatedBy(creator);

        validatePricing(opt);

        return toResponse(transportOptionRepository.save(opt));
    }

    @Transactional
    public TransportOptionResponse update(Long id, UpdateTransportOptionRequest req) {
        TransportOption opt = findOrThrow(id);

        if (req.getMode() != null) opt.setMode(req.getMode().trim());
        if (req.getName() != null) opt.setName(req.getName());
        if (req.getDescription() != null) opt.setDescription(req.getDescription());
        if (req.getBidirectional() != null) opt.setBidirectional(req.getBidirectional());
        if (req.getPricingType() != null) opt.setPricingType(normalizePricingType(req.getPricingType()));
        if (req.getPriceMad() != null) opt.setPriceMad(req.getPriceMad());
        if (req.getPricePerKmMad() != null) opt.setPricePerKmMad(req.getPricePerKmMad());
        if (req.getCurrency() != null) opt.setCurrency(req.getCurrency().trim().toUpperCase());
        if (req.getServiceStartTime() != null) opt.setServiceStartTime(req.getServiceStartTime());
        if (req.getServiceEndTime() != null) opt.setServiceEndTime(req.getServiceEndTime());
        if (req.getDistanceKm() != null) opt.setDistanceKm(req.getDistanceKm());
        if (req.getDurationMinutes() != null) opt.setDurationMinutes(req.getDurationMinutes());

        validatePricing(opt);

        return toResponse(transportOptionRepository.save(opt));
    }

    @Transactional
    public void delete(Long id) {
        if (!transportOptionRepository.existsById(id)) {
            throw new NotFoundException("Transport option not found");
        }
        transportOptionRepository.deleteById(id);
    }

    private List<TransportOption> listForPlaces(Long fromPlaceId, Long toPlaceId) {
        List<TransportOption> direct = transportOptionRepository.findByFromPlaceIdAndToPlaceId(fromPlaceId, toPlaceId);
        List<TransportOption> reverse = transportOptionRepository.findByFromPlaceIdAndToPlaceId(toPlaceId, fromPlaceId);

        List<TransportOption> res = new ArrayList<>(direct);
        for (TransportOption opt : reverse) {
            if (opt.isBidirectional()) {
                res.add(opt);
            }
        }
        return res;
    }

    private void validatePricing(TransportOption opt) {
        String pricingType = opt.getPricingType();

        if (pricingType.equals("PER_PERSON") || pricingType.equals("PER_RIDE")) {
            if (opt.getPriceMad() == null) {
                throw new BadRequestException("priceMad is required for pricingType " + pricingType);
            }
        }

        if (pricingType.equals("PER_KM")) {
            if (opt.getPricePerKmMad() == null) {
                throw new BadRequestException("pricePerKmMad is required for pricingType PER_KM");
            }
        }
    }

    private String normalizePricingType(String pricingType) {
        if (pricingType == null) throw new BadRequestException("Pricing type is required");
        return pricingType.trim().toUpperCase();
    }

    private TransportOptionResponse toResponse(TransportOption opt) {
        TransportOptionResponse r = new TransportOptionResponse();
        r.setId(opt.getId());
        r.setFromPlaceId(opt.getFromPlace().getId());
        r.setFromPlaceName(opt.getFromPlace().getName());
        r.setToPlaceId(opt.getToPlace().getId());
        r.setToPlaceName(opt.getToPlace().getName());
        r.setMode(opt.getMode());
        r.setName(opt.getName());
        r.setDescription(opt.getDescription());
        r.setBidirectional(opt.isBidirectional());
        r.setPricingType(opt.getPricingType());
        r.setPriceMad(opt.getPriceMad());
        r.setPricePerKmMad(opt.getPricePerKmMad());
        r.setCurrency(opt.getCurrency());
        r.setServiceStartTime(opt.getServiceStartTime());
        r.setServiceEndTime(opt.getServiceEndTime());
        r.setDistanceKm(opt.getDistanceKm());
        r.setDurationMinutes(opt.getDurationMinutes());
        r.setCreatedAt(opt.getCreatedAt());
        r.setCreatedBy(opt.getCreatedBy().getId());
        return r;
    }

    private TransportOption findOrThrow(Long id) {
        return transportOptionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transport option not found"));
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
