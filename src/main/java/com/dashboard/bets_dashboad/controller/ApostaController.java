package com.dashboard.bets_dashboad.controller;

import com.dashboard.bets_dashboad.dto.ApostaRequestDTO;
import com.dashboard.bets_dashboad.dto.ApostaResponseDTO;
import com.dashboard.bets_dashboad.dto.DashboardMetricsDTO;
import com.dashboard.bets_dashboad.dto.LiquidarApostaDTO;
import com.dashboard.bets_dashboad.model.User;
import com.dashboard.bets_dashboad.service.ApostaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apostas")
public class ApostaController {

    private final ApostaService apostaService;

    public ApostaController(ApostaService apostaService) {
        this.apostaService = apostaService;
    }

    // 1. Criar Aposta (ID obtido automaticamente do Token)
    @PostMapping
    public ResponseEntity<ApostaResponseDTO> criarAposta(
            @AuthenticationPrincipal User usuarioLogado,
            @RequestBody @Valid ApostaRequestDTO dto) {

        ApostaResponseDTO response = apostaService.criarAposta(usuarioLogado.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Listar Apostas Paginadas do Utilizador Autenticado
    @GetMapping
    public ResponseEntity<Page<ApostaResponseDTO>> listarApostas(
            @AuthenticationPrincipal User usuarioLogado,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {

        Page<ApostaResponseDTO> apostas = apostaService.listarApostasPorUsuario(usuarioLogado.getId(), pageable);
        return ResponseEntity.ok(apostas);
    }

    // 3. Liquidar Aposta
    @PatchMapping("/{id}/liquidar")
    public ResponseEntity<ApostaResponseDTO> liquidarAposta(
            @PathVariable Long id,
            @RequestBody @Valid LiquidarApostaDTO dto) {

        ApostaResponseDTO response = apostaService.liquidarAposta(id, dto);
        return ResponseEntity.ok(response);
    }

    // 4. Obter Dashboard do Utilizador Autenticado
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetricsDTO> obterDashboard(@AuthenticationPrincipal User usuarioLogado) {
        DashboardMetricsDTO dashboard = apostaService.calcularMetricasDashboard(usuarioLogado.getId());
        return ResponseEntity.ok(dashboard);
    }

    // 5. Buscar Aposta por ID do Utilizador Autenticado
    @GetMapping("/{id}")
    public ResponseEntity<ApostaResponseDTO> buscarPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal User usuarioLogado) {

        ApostaResponseDTO aposta = apostaService.buscarPorId(id, usuarioLogado.getId());
        return ResponseEntity.ok(aposta);
    }
}