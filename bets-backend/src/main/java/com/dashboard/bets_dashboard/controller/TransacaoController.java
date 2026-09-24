package com.dashboard.bets_dashboard.controller;

import com.dashboard.bets_dashboard.dto.TransacaoRequestDTO;
import com.dashboard.bets_dashboard.dto.TransacaoResponseDTO;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.service.TransacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    @PostMapping
    public ResponseEntity<TransacaoResponseDTO> criarTransacao(
            Authentication authentication,
            @RequestBody @Valid TransacaoRequestDTO dto) {

        User user = (User) authentication.getPrincipal();
        TransacaoResponseDTO response = transacaoService.criarTransacao(user.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TransacaoResponseDTO>> listarTransacoes(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<TransacaoResponseDTO> transacoes = transacaoService.listarTransacoesPorUsuario(user.getId());
        return ResponseEntity.ok(transacoes);
    }
}