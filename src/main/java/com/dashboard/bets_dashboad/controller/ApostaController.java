package com.dashboard.bets_dashboad.controller;


import com.dashboard.bets_dashboad.dto.ApostaRequestDTO;
import com.dashboard.bets_dashboad.dto.ApostaResponseDTO;
import com.dashboard.bets_dashboad.dto.DashboardMetricsDTO;
import com.dashboard.bets_dashboad.dto.LiquidarApostaDTO;
import com.dashboard.bets_dashboad.model.Aposta;
import com.dashboard.bets_dashboad.service.ApostaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apostas")
public class ApostaController {

    private final ApostaService apostaService;

    public ApostaController(ApostaService apostaService) {
        this.apostaService = apostaService;
    }

    // Cadastrar nova Aposta
    @PostMapping
    public ResponseEntity<ApostaResponseDTO> criarAposta(@Valid @RequestBody ApostaRequestDTO dto) {
        ApostaResponseDTO response = apostaService.criarAposta(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Liquidar Aposta
    @PatchMapping("/{id}/liquidar")
    public ResponseEntity<ApostaResponseDTO> liquidarAposta(
            @PathVariable Long id,
            @Valid @RequestBody LiquidarApostaDTO dto){
            ApostaResponseDTO response = apostaService.liquidarAposta(id, dto);
            return ResponseEntity.ok(response);
        }

    // Consultar métricas consolidadas do Dashboard (P&L, ROI, Win Rate)
    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<DashboardMetricsDTO> obterMetricasDashboard(@PathVariable Long userId) {
        DashboardMetricsDTO metrics = apostaService.calcularMetricasDashboard(userId);
        return ResponseEntity.ok(metrics);
    }

    // Busca por Usuário
    @GetMapping
    public ResponseEntity<Page<Aposta>> buscarPorUser(
            @RequestParam Long userId,
            Pageable pageable){
        Page<Aposta> apostas = apostaService.buscarPorUser(userId, pageable);
        return ResponseEntity.ok(apostas);
    }
}
