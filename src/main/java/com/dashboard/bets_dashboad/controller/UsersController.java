package com.dashboard.bets_dashboad.controller;

import com.dashboard.bets_dashboad.model.User;
import com.dashboard.bets_dashboad.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    private final UserRepository usuarioRepository;

    public UsersController(UserRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public ResponseEntity<User> criar(@RequestBody User user) {
        User newUser = usuarioRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }
}