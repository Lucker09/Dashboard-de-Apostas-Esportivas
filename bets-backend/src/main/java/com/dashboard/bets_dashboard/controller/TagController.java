package com.dashboard.bets_dashboard.controller;

import com.dashboard.bets_dashboard.model.Tag;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService service;

    @GetMapping
    public ResponseEntity<List<Tag>> listar(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.listarPorUsuario(user));
    }

    @PostMapping
    public ResponseEntity<Tag> criar(@RequestBody Tag tag, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.criar(tag, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> apagar(@PathVariable Long id, @AuthenticationPrincipal User user) {
        service.apagar(id, user);
        return ResponseEntity.noContent().build();
    }
}