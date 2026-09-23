package com.dashboard.bets_dashboard.dto;


import com.dashboard.bets_dashboard.model.StatusAposta;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class LiquidarApostaDTO {

    @NotNull(message = "O status da aposta é obrigatório")
    private StatusAposta status;

    // Obrigatorio apenas se status == CASHOUT
    private BigDecimal valorResgatado;
}
