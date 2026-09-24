package com.dashboard.bets_dashboard.controller;

import com.dashboard.bets_dashboard.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<User> obterDadosUtilizador(Authentication authentication) {
        // Extrai o utilizador autenticado a partir do contexto de segurança
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }
}