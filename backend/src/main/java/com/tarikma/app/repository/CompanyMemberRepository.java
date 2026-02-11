package com.tarikma.app.repository;

import com.tarikma.app.entity.CompanyMember;
import com.tarikma.app.entity.CompanyMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyMemberRepository extends JpaRepository<CompanyMember, CompanyMemberId> {
    List<CompanyMember> findByCompanyId(Long companyId);
    List<CompanyMember> findByUserId(Long userId);
}
