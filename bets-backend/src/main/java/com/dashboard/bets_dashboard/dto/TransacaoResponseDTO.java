package com.dashboard.bets_dashboard.dto;

import com.dashboard.bets_dashboard.model.TipoTransacao;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class TransacaoResponseDTO {
    private Long id;
    private Long userId;
    private TipoTransacao tipo;
    private BigDecimal valor;
    private LocalDateTime dataCriacao;
}