package com.dashboard.bets_dashboad.controller;

import com.dashboard.bets_dashboad.dto.AuthResponseDTO;
import com.dashboard.bets_dashboad.dto.LoginRequestDTO;
import com.dashboard.bets_dashboad.repository.UserRepository;
import com.dashboard.bets_dashboad.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        var user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        String token = jwtUtil.gerarToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponseDTO(token));
    }
}