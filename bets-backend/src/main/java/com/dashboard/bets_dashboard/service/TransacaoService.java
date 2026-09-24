package com.dashboard.bets_dashboard.service;

import com.dashboard.bets_dashboard.dto.TransacaoRequestDTO;
import com.dashboard.bets_dashboard.dto.TransacaoResponseDTO;
import com.dashboard.bets_dashboard.model.TipoTransacao;
import com.dashboard.bets_dashboard.model.Transacao;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.repository.TransacaoRepository;
import com.dashboard.bets_dashboard.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransacaoService {

    private final TransacaoRepository transacaoRepository;
    private final UserRepository userRepository;

    public TransacaoService(TransacaoRepository transacaoRepository, UserRepository userRepository) {
        this.transacaoRepository = transacaoRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TransacaoResponseDTO criarTransacao(Long userId, TransacaoRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizador não encontrado."));

        if (dto.getTipo() == TipoTransacao.SAQUE) {
            if (user.getSaldo().compareTo(dto.getValor()) < 0) {
                throw new IllegalArgumentException("Saldo insuficiente para realizar o saque.");
            }
            user.setSaldo(user.getSaldo().subtract(dto.getValor()));
        } else if (dto.getTipo() == TipoTransacao.DEPOSITO) {
            user.setSaldo(user.getSaldo().add(dto.getValor()));
        }

        userRepository.save(user);

        Transacao transacao = new Transacao();
        transacao.setUser(user);
        transacao.setTipo(dto.getTipo());
        transacao.setValor(dto.getValor());

        Transacao salva = transacaoRepository.save(transacao);
        return converterParaResponseDTO(salva);
    }

    @Transactional(readOnly = true)
    public List<TransacaoResponseDTO> listarTransacoesPorUsuario(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Utilizador não encontrado.");
        }

        return transacaoRepository.findByUserId(userId).stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    private TransacaoResponseDTO converterParaResponseDTO(Transacao t) {
        return TransacaoResponseDTO.builder()
                .id(t.getId())
                .userId(t.getUser().getId())
                .tipo(t.getTipo())
                .valor(t.getValor())
                .dataCriacao(t.getDataCriacao())
                .build();
    }
}