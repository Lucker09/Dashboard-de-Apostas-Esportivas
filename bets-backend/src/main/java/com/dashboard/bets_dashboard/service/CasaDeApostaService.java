package com.dashboard.bets_dashboard.service;

import com.dashboard.bets_dashboard.model.CasaDeAposta;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.repository.CasaDeApostaRepository;
import com.dashboard.bets_dashboard.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CasaDeApostaService {

    private final CasaDeApostaRepository casaDeApostaRepository;
    private final UserRepository userRepository;

    public CasaDeApostaService(CasaDeApostaRepository casaDeApostaRepository, UserRepository userRepository) {
        this.casaDeApostaRepository = casaDeApostaRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public List<CasaDeAposta> listarCasasPorUsuario(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizador não encontrado"));

        List<CasaDeAposta> casas = casaDeApostaRepository.findByUserId(userId);

        // Garantir que as 3 casas padrão existem para o utilizador
        verificarCriarCasaPadrao(user, casas, "Bet365", "#107c41");
        verificarCriarCasaPadrao(user, casas, "Betano", "#f36f21");
        verificarCriarCasaPadrao(user, casas, "Superbet", "#e50914");

        return casaDeApostaRepository.findByUserId(userId);
    }

    private void verificarCriarCasaPadrao(User user, List<CasaDeAposta> casas, String nome, String cor) {
        boolean existe = casas.stream().anyMatch(c -> c.getNome().equalsIgnoreCase(nome));
        if (!existe) {
            CasaDeAposta nova = new CasaDeAposta();
            nova.setNome(nome);
            nova.setCor(cor);
            nova.setUser(user);
            casaDeApostaRepository.save(nova);
            casas.add(nova);
        }
    }

    @Transactional
    public CasaDeAposta criarCasa(Long userId, String nome, String cor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilizador não encontrado"));

        CasaDeAposta casa = new CasaDeAposta();
        casa.setNome(nome);
        casa.setCor(cor != null ? cor : "#3b82f6");
        casa.setUser(user);
        return casaDeApostaRepository.save(casa);
    }

    @Transactional
    public void apagarCasa(Long id, Long userId) {
        CasaDeAposta casa = casaDeApostaRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Casa de aposta não encontrada."));

        String nome = casa.getNome().toLowerCase();
        if (nome.equals("bet365") || nome.equals("betano") || nome.equals("superbet")) {
            throw new IllegalArgumentException("Não é permitido excluir as casas de aposta padrão do sistema.");
        }

        casaDeApostaRepository.delete(casa);
    }
}