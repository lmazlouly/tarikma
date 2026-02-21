package com.tarikma.app.repository;

import com.tarikma.app.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByCircuitSessionId(Long circuitSessionId);

    Optional<Booking> findByStripeCheckoutId(String stripeCheckoutId);

    long countByCircuitSessionIdAndStatus(Long circuitSessionId, String status);

    boolean existsByCircuitSessionIdAndUserId(Long circuitSessionId, Long userId);
}
