package com.dashboard.bets_dashboard.dto;

import com.dashboard.bets_dashboard.model.TipoTransacao;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TransacaoRequestDTO {

    @NotNull(message = "O tipo da transação é obrigatório (DEPOSITO ou SAQUE).")
    private TipoTransacao tipo;

    @NotNull(message = "O valor é obrigatório.")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior do que zero.")
    private BigDecimal valor;
}