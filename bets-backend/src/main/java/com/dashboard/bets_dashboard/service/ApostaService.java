package com.dashboard.bets_dashboard.service;

import com.dashboard.bets_dashboard.dto.ApostaRequestDTO;
import com.dashboard.bets_dashboard.dto.ApostaResponseDTO;
import com.dashboard.bets_dashboard.dto.DashboardMetricsDTO;
import com.dashboard.bets_dashboard.dto.LiquidarApostaDTO;
import com.dashboard.bets_dashboard.exception.ConflitoException;
import com.dashboard.bets_dashboard.exception.RecursoNaoEncontradoException;
import com.dashboard.bets_dashboard.model.Aposta;
import com.dashboard.bets_dashboard.model.CasaDeAposta;
import com.dashboard.bets_dashboard.model.StatusAposta;
import com.dashboard.bets_dashboard.model.Tag;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.repository.ApostaRepository;
import com.dashboard.bets_dashboard.repository.CasaDeApostaRepository;
import com.dashboard.bets_dashboard.repository.TagRepository;
import com.dashboard.bets_dashboard.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;

@Service
public class ApostaService {

    private final ApostaRepository apostaRepository;
    private final UserRepository userRepository;
    private final CasaDeApostaRepository casaDeApostaRepository;
    private final TagRepository tagRepository;

    public ApostaService(ApostaRepository apostaRepository,
                         UserRepository userRepository,
                         CasaDeApostaRepository casaDeApostaRepository,
                         TagRepository tagRepository) {
        this.apostaRepository = apostaRepository;
        this.userRepository = userRepository;
        this.casaDeApostaRepository = casaDeApostaRepository;
        this.tagRepository = tagRepository;
    }

    // 1. Listar apostas paginadas do utilizador
    @Transactional(readOnly = true)
    public Page<ApostaResponseDTO> listarApostasPorUsuario(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Utilizador não encontrado com ID: " + userId);
        }

        Pageable pageableOrdenado = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "dataCriacao")
        );

        return apostaRepository.findByUserId(userId, pageableOrdenado)
                .map(this::converterParaResponseDTO);
    }

    // 1.5. Listar TODAS as apostas do utilizador em formato de Lista
    @Transactional(readOnly = true)
    public List<ApostaResponseDTO> listarTodasApostasPorUsuario(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Utilizador não encontrado com ID: " + userId);
        }

        List<Aposta> apostas = apostaRepository.findByUserId(userId);
        return apostas.stream()
                .sorted(Comparator.comparing(Aposta::getDataCriacao, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::converterParaResponseDTO)
                .toList();
    }

    // 2. Criar Aposta
    @Transactional
    public ApostaResponseDTO criarAposta(Long userId, ApostaRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizador não encontrado com ID: " + userId));

        if (user.getSaldo().compareTo(dto.getValorApostado()) < 0) {
            throw new IllegalArgumentException("Saldo insuficiente para realizar esta aposta.");
        }

        user.setSaldo(user.getSaldo().subtract(dto.getValorApostado()));
        userRepository.save(user);

        CasaDeAposta casaDeAposta = casaDeApostaRepository.findByIdAndUserId(dto.getCasaDeApostaId(), userId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Casa de aposta não encontrada ou não autorizada."));

        HashSet<Tag> tagsSet = new HashSet<>();
        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {
            List<Tag> tags = tagRepository.findAllById(dto.getTagIds());
            boolean todasDoUtilizador = tags.stream().allMatch(t -> t.getUser().getId().equals(userId));
            if (!todasDoUtilizador) {
                throw new IllegalArgumentException("Uma ou mais tags não pertencem ao utilizador.");
            }
            tagsSet = new HashSet<>(tags);
        }

        Aposta aposta = new Aposta();
        aposta.setUser(user);
        aposta.setDescricao(dto.getDescricao());
        aposta.setValorApostado(dto.getValorApostado());
        aposta.setOdd(dto.getOdd());
        aposta.setStatus(StatusAposta.PENDENTE);
        aposta.setCasaDeAposta(casaDeAposta);
        aposta.setTags(tagsSet);

        Aposta salva = apostaRepository.save(aposta);
        return converterParaResponseDTO(salva);
    }

    // 2.5. Atualizar Aposta (para edição de tags e dados)
    @Transactional
    public ApostaResponseDTO atualizarAposta(Long id, Long userId, ApostaRequestDTO dto) {
        Aposta aposta = apostaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aposta não encontrada."));

        if (!aposta.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Não tem permissão para editar esta aposta.");
        }

        // Se o DTO não trouxer a casa de aposta (ex: ao atualizar apenas tags), mantém a atual
        Long casaId = (dto.getCasaDeApostaId() != null)
                ? dto.getCasaDeApostaId()
                : aposta.getCasaDeAposta().getId();

        CasaDeAposta casaDeAposta = casaDeApostaRepository.findByIdAndUserId(casaId, userId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Casa de aposta não encontrada ou não autorizada."));

        HashSet<Tag> tagsSet = new HashSet<>();
        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {
            List<Tag> tags = tagRepository.findAllById(dto.getTagIds());
            boolean todasDoUtilizador = tags.stream().allMatch(t -> t.getUser().getId().equals(userId));
            if (!todasDoUtilizador) {
                throw new IllegalArgumentException("Uma ou mais tags não pertencem ao utilizador.");
            }
            tagsSet = new HashSet<>(tags);
        }

        aposta.setDescricao(dto.getDescricao() != null ? dto.getDescricao() : aposta.getDescricao());
        aposta.setOdd(dto.getOdd() != null ? dto.getOdd() : aposta.getOdd());
        aposta.setValorApostado(dto.getValorApostado() != null ? dto.getValorApostado() : aposta.getValorApostado());
        if (dto.getValorApostado() != null && dto.getOdd() != null) {
            aposta.setRetornoPotencial(dto.getValorApostado().multiply(dto.getOdd()));
        }
        aposta.setCasaDeAposta(casaDeAposta);
        aposta.setTags(tagsSet);

        Aposta atualizada = apostaRepository.save(aposta);
        return converterParaResponseDTO(atualizada);
    }

    // 3. Liquidar Aposta
    @Transactional
    public ApostaResponseDTO liquidarAposta(Long apostaId, Long userId, LiquidarApostaDTO dto) {
        StatusAposta novoStatus = dto.getStatus();

        if (novoStatus == StatusAposta.PENDENTE) {
            throw new IllegalArgumentException("Não é possível liquidar uma aposta para o status PENDENTE.");
        }

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
            case ANULADA -> aposta.getValorApostado();
            case CASHOUT -> {
                if (dto.getValorResgatado() == null || dto.getValorResgatado().compareTo(BigDecimal.ZERO) < 0) {
                    throw new IllegalArgumentException("É obrigatório informar o valor resgatado no CASHOUT.");
                }
                yield dto.getValorResgatado().setScale(2, RoundingMode.HALF_UP);
            }
            case PENDENTE -> throw new IllegalArgumentException("Não é possível liquidar uma aposta para o status PENDENTE.");
        };

        User user = aposta.getUser();
        if (novoStatus == StatusAposta.GREEN || novoStatus == StatusAposta.CASHOUT) {
            user.setSaldo(user.getSaldo().add(valorResgatado));
        } else if (novoStatus == StatusAposta.ANULADA) {
            user.setSaldo(user.getSaldo().add(aposta.getValorApostado()));
        }
        userRepository.save(user);

        aposta.setStatus(novoStatus);
        aposta.setValorResgatado(valorResgatado);
        aposta.setDataLiquidacao(LocalDateTime.now());

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

    // 5. Buscar aposta por ID
    @Transactional(readOnly = true)
    public ApostaResponseDTO buscarPorId(Long apostaId, Long userId) {
        Aposta aposta = apostaRepository.findByIdAndUserId(apostaId, userId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aposta não encontrada com ID: " + apostaId));

        return converterParaResponseDTO(aposta);
    }

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
                .casaDeAposta(aposta.getCasaDeAposta()) // Incluído corretamente
                .tags(aposta.getTags())                 // Incluído corretamente
                .build();
    }
}