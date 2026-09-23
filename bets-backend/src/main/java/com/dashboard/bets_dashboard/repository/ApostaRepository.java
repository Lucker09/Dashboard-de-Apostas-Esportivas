package com.dashboard.bets_dashboard.repository;

import com.dashboard.bets_dashboard.model.Aposta;
import com.dashboard.bets_dashboard.model.StatusAposta;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApostaRepository extends JpaRepository<Aposta, Long> {
    Page<Aposta> findByUserId(Long userId, Pageable pageable);
    List<Aposta> findByUserIdAndStatus(Long userId, StatusAposta status);
    List<Aposta> findByUserId(Long userId);

    // Só devolve a aposta se ela pertencer ao utilizador informado
    Optional<Aposta> findByIdAndUserId(Long id, Long userId);

    // Bloqueia a linha durante a liquidação, evitando liquidar duas vezes em requisições simultâneas
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Aposta a where a.id = :id and a.user.id = :userId")
    Optional<Aposta> buscarParaLiquidacao(@Param("id") Long id, @Param("userId") Long userId);
}
