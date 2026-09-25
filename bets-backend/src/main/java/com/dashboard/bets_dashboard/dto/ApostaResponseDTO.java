package com.dashboard.bets_dashboard.dto;

import com.dashboard.bets_dashboard.model.CasaDeAposta;
import com.dashboard.bets_dashboard.model.StatusAposta;
import com.dashboard.bets_dashboard.model.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApostaResponseDTO {
    private Long id;
    private Long userId;
    private String descricao;
    private BigDecimal valorApostado;
    private BigDecimal odd;
    private StatusAposta status;
    private BigDecimal valorResgatado;
    private BigDecimal profitAndLoss;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataLiquidacao;

    // Adicione estes dois campos em falta para o Builder funcionar:
    private CasaDeAposta casaDeAposta;
    private Set<Tag> tags;
}