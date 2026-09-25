package com.dashboard.bets_dashboard.repository;

import com.dashboard.bets_dashboard.model.CasaDeAposta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CasaDeApostaRepository extends JpaRepository<CasaDeAposta, Long> {
    List<CasaDeAposta> findByUserId(Long userId);
    Optional<CasaDeAposta> findByIdAndUserId(Long id, Long userId);
}