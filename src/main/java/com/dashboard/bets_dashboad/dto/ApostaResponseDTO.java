package com.dashboard.bets_dashboad.dto;

import com.dashboard.bets_dashboad.model.StatusAposta;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ApostaResponseDTO {
    private Long id;
    private Long userId;
    private String descricao;
    private BigDecimal valorApostado;
    private BigDecimal odd;
    private StatusAposta status;
    private BigDecimal valorResgatado;
    private BigDecimal profitAndLoss; //P%L individual da aposta
    private LocalDateTime dataCriacao;
    private LocalDateTime dataLiquidacao;
}
