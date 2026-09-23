package com.dashboard.bets_dashboard.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ApostaRequestDTO {

    @NotBlank(message = "A descrição não pode estar em branco")
    private String descricao;

    @NotNull(message = "O valor apostado é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor apostado deve ser maior que zero")
    private BigDecimal valorApostado;

    @NotNull(message = "A odd é obrigatória")
    @DecimalMin(value = "1.01", message = "A odd mínima permitida é 1.01")
    private BigDecimal odd;
}
