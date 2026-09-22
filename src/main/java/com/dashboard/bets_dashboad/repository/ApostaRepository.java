package com.dashboard.bets_dashboad.repository;

import com.dashboard.bets_dashboad.model.Aposta;
import com.dashboard.bets_dashboad.model.StatusAposta;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ApostaRepository extends JpaRepository<Aposta, Long> {
    Page<Aposta> findByUserId(Long userId, Pageable pageable);
    List<Aposta> findByUserIdAndStatus(Long userId, StatusAposta status);
    List<Aposta> findByUserId(Long userId);

}
