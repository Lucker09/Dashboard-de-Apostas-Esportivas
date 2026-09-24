package com.dashboard.bets_dashboard.controller;

import com.dashboard.bets_dashboard.dto.ApostaRequestDTO;
import com.dashboard.bets_dashboard.dto.ApostaResponseDTO;
import com.dashboard.bets_dashboard.dto.LiquidarApostaDTO;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.service.ApostaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apostas")
public class ApostaController {

    private final ApostaService apostaService;

    public ApostaController(ApostaService apostaService) {
        this.apostaService = apostaService;
    }

    @GetMapping
    public ResponseEntity<Page<ApostaResponseDTO>> listarApostas(
            Authentication authentication,
            Pageable pageable) {

        User user = (User) authentication.getPrincipal();
        Page<ApostaResponseDTO> apostas = apostaService.listarApostasPorUsuario(user.getId(), pageable);
        return ResponseEntity.ok(apostas);
    }

    @PostMapping
    public ResponseEntity<ApostaResponseDTO> criarAposta(
            Authentication authentication,
            @RequestBody @Valid ApostaRequestDTO dto) {

        User user = (User) authentication.getPrincipal();
        ApostaResponseDTO novaAposta = apostaService.criarAposta(user.getId(), dto);
        return ResponseEntity.status(201).body(novaAposta);
    }

    @PatchMapping("/{id}/liquidar")
    public ResponseEntity<ApostaResponseDTO> liquidarAposta(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody @Valid LiquidarApostaDTO dto) {

        User user = (User) authentication.getPrincipal();

        // Certifique-se de que o seu ApostaService possui um método que aceita o DTO ou os parâmetros (status e valorResgatado)
        ApostaResponseDTO resposta = apostaService.liquidarAposta(id,user.getId(), dto);

        return ResponseEntity.ok(resposta);
    }
}