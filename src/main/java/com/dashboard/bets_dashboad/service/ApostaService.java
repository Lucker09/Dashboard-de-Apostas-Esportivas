package com.dashboard.bets_dashboad.service;

import com.dashboard.bets_dashboad.dto.ApostaRequestDTO;
import com.dashboard.bets_dashboad.dto.ApostaResponseDTO;
import com.dashboard.bets_dashboad.dto.DashboardMetricsDTO;
import com.dashboard.bets_dashboad.dto.LiquidarApostaDTO;
import com.dashboard.bets_dashboad.model.Aposta;
import com.dashboard.bets_dashboad.model.StatusAposta;
import com.dashboard.bets_dashboad.model.User;
import com.dashboard.bets_dashboad.repository.ApostaRepository;
import com.dashboard.bets_dashboad.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApostaService {

    private final ApostaRepository apostaRepository;
    private final UserRepository userRepository;

    public ApostaService(ApostaRepository apostaRepository, UserRepository userRepository) {
        this.apostaRepository = apostaRepository;
        this.userRepository = userRepository;
    }

    // 1. Listar apostas paginadas do usuário
    @Transactional(readOnly = true)
    public Page<ApostaResponseDTO> listarApostasPorUsuario(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Usuário não encontrado com ID: " + userId);
        }

        return apostaRepository.findByUserId(userId, pageable)
                .map(this::converterParaResponseDTO);
    }

    // 2. Criar Aposta (userId injetado via Controller / JWT)
    @Transactional
    public ApostaResponseDTO criarAposta(Long userId, ApostaRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + userId));

        Aposta aposta = new Aposta();
        aposta.setUser(user);
        aposta.setDescricao(dto.getDescricao());
        aposta.setValorApostado(dto.getValorApostado());
        aposta.setOdd(dto.getOdd());
        aposta.setStatus(StatusAposta.PENDENTE);

        Aposta salva = apostaRepository.save(aposta);
        return converterParaResponseDTO(salva);
    }

    // 3. Liquidar Aposta
    @Transactional
    public ApostaResponseDTO liquidarAposta(Long apostaId, LiquidarApostaDTO dto) {
        Aposta aposta = apostaRepository.findById(apostaId)
                .orElseThrow(() -> new IllegalArgumentException("Aposta não encontrada."));

        StatusAposta novoStatus = dto.getStatus();

        if (novoStatus == StatusAposta.PENDENTE) {
            throw new IllegalArgumentException("Não é possível liquidar uma aposta para o status PENDENTE.");
        }

        aposta.setStatus(novoStatus);
        aposta.setDataLiquidacao(LocalDateTime.now());

        switch (novoStatus) {
            case GREEN -> {
                BigDecimal retornoBruto = aposta.getValorApostado().multiply(aposta.getOdd());
                aposta.setValorResgatado(retornoBruto);
            }
            case RED -> aposta.setValorResgatado(BigDecimal.ZERO);
            case ANULADA -> aposta.setValorResgatado(aposta.getValorApostado()); // Estorno
            case CASHOUT -> {
                if (dto.getValorResgatado() == null || dto.getValorResgatado().compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException("É obrigatório informar o valor resgatado no CASHOUT.");
                }
                aposta.setValorResgatado(dto.getValorResgatado());
            }
            default -> {
            }
        }

        Aposta atualizada = apostaRepository.save(aposta);
        return converterParaResponseDTO(atualizada);
    }

    // 4. Métricas consolidadas do Dashboard
    @Transactional(readOnly = true)
    public DashboardMetricsDTO calcularMetricasDashboard(Long userId) {
        List<Aposta> apostas = apostaRepository.findByUserId(userId);

        BigDecimal totalApostado = BigDecimal.ZERO;
        BigDecimal totalRetornado = BigDecimal.ZERO;
        long ganhas = 0;
        long perdidas = 0;
        long pendentes = 0;

        for (Aposta a : apostas) {
            if (a.getStatus() == StatusAposta.PENDENTE) {
                pendentes++;
                continue;
            }

            totalApostado = totalApostado.add(a.getValorApostado());
            if (a.getValorResgatado() != null) {
                totalRetornado = totalRetornado.add(a.getValorResgatado());
            }

            if (a.getStatus() == StatusAposta.GREEN) ganhas++;
            if (a.getStatus() == StatusAposta.RED) perdidas++;
        }

        BigDecimal profitAndLossTotal = totalRetornado.subtract(totalApostado);

        BigDecimal roiPercentage = BigDecimal.ZERO;
        if (totalApostado.compareTo(BigDecimal.ZERO) > 0) {
            roiPercentage = profitAndLossTotal
                    .divide(totalApostado, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        long apostasDefinidas = ganhas + perdidas;
        BigDecimal winRatePercentage = BigDecimal.ZERO;
        if (apostasDefinidas > 0) {
            winRatePercentage = BigDecimal.valueOf(ganhas)
                    .divide(BigDecimal.valueOf(apostasDefinidas), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return DashboardMetricsDTO.builder()
                .totalApostado(totalApostado)
                .totalRetornado(totalRetornado)
                .profitAndLossTotal(profitAndLossTotal)
                .roiPercentage(roiPercentage)
                .winRatePercentage(winRatePercentage)
                .totalApostas(apostas.size())
                .apostasGanhas(ganhas)
                .apostasPerdidas(perdidas)
                .apostasPendentes(pendentes)
                .build();
    }

    // 5. Buscar aposta por ID do utilizador
    @Transactional(readOnly = true)
    public ApostaResponseDTO buscarPorId(Long apostaId, Long userId) {
        Aposta aposta = apostaRepository.findById(apostaId)
                .orElseThrow(() -> new IllegalArgumentException("Aposta não encontrada com ID: " + apostaId));

        if (!aposta.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Acesso negado: a aposta pertence a outro utilizador.");
        }

        return converterParaResponseDTO(aposta);
    }

    // Método privado auxiliar para conversão
    private ApostaResponseDTO converterParaResponseDTO(Aposta aposta) {
        BigDecimal pnl = BigDecimal.ZERO;

        if (aposta.getStatus() != StatusAposta.PENDENTE && aposta.getValorResgatado() != null) {
            pnl = aposta.getValorResgatado().subtract(aposta.getValorApostado());
        }

        return ApostaResponseDTO.builder()
                .id(aposta.getId())
                .userId(aposta.getUser().getId())
                .descricao(aposta.getDescricao())
                .valorApostado(aposta.getValorApostado())
                .odd(aposta.getOdd())
                .status(aposta.getStatus())
                .valorResgatado(aposta.getValorResgatado())
                .profitAndLoss(pnl)
                .dataCriacao(aposta.getDataCriacao())
                .dataLiquidacao(aposta.getDataLiquidacao())
                .build();
    }
}