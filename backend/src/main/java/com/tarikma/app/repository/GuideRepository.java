package com.tarikma.app.repository;

import com.tarikma.app.entity.Guide;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuideRepository extends JpaRepository<Guide, Long> {
}
