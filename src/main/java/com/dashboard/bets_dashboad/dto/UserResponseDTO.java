package com.dashboard.bets_dashboad.dto;

import java.time.LocalDateTime;

public record UserResponseDTO(
        Long id,
        String email,
        LocalDateTime dataCriacao
) {}