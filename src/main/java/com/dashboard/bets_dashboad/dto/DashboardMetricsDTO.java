package com.dashboard.bets_dashboad.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DashboardMetricsDTO {
    private BigDecimal totalApostado;
    private BigDecimal totalRetornado;
    private BigDecimal profitAndLossTotal;
    private BigDecimal roiPercentage;
    private BigDecimal winRatePercentage;
    private long totalApostas;
    private long apostasGanhas;
    private long apostasPerdidas;
    private long apostasPendentes;

}
