package com.dashboard.bets_dashboard.service;

import com.dashboard.bets_dashboard.model.Tag;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository repository;

    public List<Tag> listarPorUsuario(User user) {
        return repository.findByUserId(user.getId());
    }

    public Tag criar(Tag tag, User user) {
        tag.setUser(user);
        return repository.save(tag);
    }

    public void apagar(Long id, User user) {
        Tag tag = repository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Tag não encontrada"));
        repository.delete(tag);
    }
}