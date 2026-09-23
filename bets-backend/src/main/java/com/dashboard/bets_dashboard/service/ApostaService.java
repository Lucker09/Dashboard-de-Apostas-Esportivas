package com.dashboard.bets_dashboard.service;

import com.dashboard.bets_dashboard.dto.ApostaRequestDTO;
import com.dashboard.bets_dashboard.dto.ApostaResponseDTO;
import com.dashboard.bets_dashboard.dto.DashboardMetricsDTO;
import com.dashboard.bets_dashboard.dto.LiquidarApostaDTO;
import com.dashboard.bets_dashboard.exception.ConflitoException;
import com.dashboard.bets_dashboard.exception.RecursoNaoEncontradoException;
import com.dashboard.bets_dashboard.model.Aposta;
import com.dashboard.bets_dashboard.model.StatusAposta;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.repository.ApostaRepository;
import com.dashboard.bets_dashboard.repository.UserRepository;
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

    // 3. Liquidar Aposta (só o dono, e só uma vez)
    @Transactional
    public ApostaResponseDTO liquidarAposta(Long apostaId, Long userId, LiquidarApostaDTO dto) {
        StatusAposta novoStatus = dto.getStatus();

        if (novoStatus == StatusAposta.PENDENTE) {
            throw new IllegalArgumentException("Não é possível liquidar uma aposta para o status PENDENTE.");
        }

        // Se a aposta não existir ou for de outro utilizador, a resposta é a mesma (404)
        Aposta aposta = apostaRepository.buscarParaLiquidacao(apostaId, userId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aposta não encontrada."));

        if (aposta.getStatus() != StatusAposta.PENDENTE) {
            throw new ConflitoException("Esta aposta já foi liquidada como " + aposta.getStatus() + ".");
        }

        BigDecimal valorResgatado = switch (novoStatus) {
            case GREEN -> aposta.getValorApostado()
                    .multiply(aposta.getOdd())
                    .setScale(2, RoundingMode.HALF_UP);
            case RED -> BigDecimal.ZERO;
            case ANULADA -> aposta.getValorApostado(); // Estorno
            case CASHOUT -> {
                if (dto.getValorResgatado() == null || dto.getValorResgatado().compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException("É obrigatório informar o valor resgatado no CASHOUT.");
                }
                yield dto.getValorResgatado().setScale(2, RoundingMode.HALF_UP);
            }
            case PENDENTE -> throw new IllegalArgumentException("Não é possível liquidar uma aposta para o status PENDENTE.");
        };

        aposta.setStatus(novoStatus);
        aposta.setValorResgatado(valorResgatado);
        aposta.setDataLiquidacao(LocalDateTime.now());

        Aposta atualizada = apostaRepository.save(aposta);
        return converterParaResponseDTO(atualizada);
    }

    // 4. Métricas consolidadas do Dashboard
    // Regras: apostas PENDENTES e ANULADAS ficam fora do total apostado/ROI.
    // Taxa de acerto = GREEN / (GREEN + RED); CASHOUT não entra nesse cálculo.
    @Transactional(readOnly = true)
    public DashboardMetricsDTO calcularMetricasDashboard(Long userId) {
        List<Aposta> apostas = apostaRepository.findByUserId(userId);

        BigDecimal totalApostado = BigDecimal.ZERO;
        BigDecimal totalRetornado = BigDecimal.ZERO;
        long ganhas = 0;
        long perdidas = 0;
        long cashouts = 0;
        long anuladas = 0;
        long pendentes = 0;

        for (Aposta a : apostas) {
            switch (a.getStatus()) {
                case PENDENTE -> {
                    pendentes++;
                    continue;
                }
                case ANULADA -> {
                    anuladas++;
                    continue;
                }
                case GREEN -> ganhas++;
                case RED -> perdidas++;
                case CASHOUT -> cashouts++;
            }

            totalApostado = totalApostado.add(a.getValorApostado());
            if (a.getValorResgatado() != null) {
                totalRetornado = totalRetornado.add(a.getValorResgatado());
            }
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
                .apostasCashout(cashouts)
                .apostasAnuladas(anuladas)
                .apostasPendentes(pendentes)
                .build();
    }

    // 5. Buscar aposta por ID do utilizador
    @Transactional(readOnly = true)
    public ApostaResponseDTO buscarPorId(Long apostaId, Long userId) {
        Aposta aposta = apostaRepository.findByIdAndUserId(apostaId, userId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aposta não encontrada com ID: " + apostaId));

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
