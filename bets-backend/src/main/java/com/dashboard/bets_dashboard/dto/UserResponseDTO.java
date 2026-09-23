package com.dashboard.bets_dashboard.dto;

import java.time.LocalDateTime;

public record UserResponseDTO(
        Long id,
        String email,
        LocalDateTime dataCriacao
) {}