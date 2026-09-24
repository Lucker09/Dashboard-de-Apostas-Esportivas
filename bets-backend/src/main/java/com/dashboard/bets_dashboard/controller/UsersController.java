package com.dashboard.bets_dashboard.controller;

import com.dashboard.bets_dashboard.dto.UserRequestDTO;
import com.dashboard.bets_dashboard.dto.UserResponseDTO;
import com.dashboard.bets_dashboard.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/register")
public class UsersController {

    private final UserService userService;

    public UsersController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> criarUsuario(@RequestBody @Valid UserRequestDTO dto) {
        UserResponseDTO response = userService.criarUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}