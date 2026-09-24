package com.dashboard.bets_dashboard.repository;

import com.dashboard.bets_dashboard.model.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    List<Transacao> findByUserId(Long userId);
}