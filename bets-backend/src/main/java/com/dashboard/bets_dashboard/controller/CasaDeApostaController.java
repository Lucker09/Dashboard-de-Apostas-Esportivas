package com.dashboard.bets_dashboard.controller;

import com.dashboard.bets_dashboard.model.CasaDeAposta;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.service.CasaDeApostaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/casas-de-aposta") // <-- Alterado para corresponder ao frontend
public class CasaDeApostaController {

    private final CasaDeApostaService service;

    public CasaDeApostaController(CasaDeApostaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CasaDeAposta>> listar(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.listarCasasPorUsuario(user.getId()));
    }

    @PostMapping
    public ResponseEntity<CasaDeAposta> criar(@RequestBody CasaDeAposta casa, @AuthenticationPrincipal User user) {
        CasaDeAposta nova = service.criarCasa(user.getId(), casa.getNome(), casa.getCor());
        return ResponseEntity.status(201).body(nova);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> apagar(@PathVariable Long id, @AuthenticationPrincipal User user) {
        service.apagarCasa(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}