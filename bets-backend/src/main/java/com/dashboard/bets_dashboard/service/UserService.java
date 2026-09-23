package com.dashboard.bets_dashboard.service;

import com.dashboard.bets_dashboard.dto.UserRequestDTO;
import com.dashboard.bets_dashboard.dto.UserResponseDTO;
import com.dashboard.bets_dashboard.model.User;
import com.dashboard.bets_dashboard.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponseDTO criarUsuario(UserRequestDTO dto) {
        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new IllegalArgumentException("Já existe um utilizador registado com este e-mail.");
        }

        User user = new User();
        user.setEmail(dto.email());

        // 🔒 Codifica a palavra-passe com BCrypt antes de guardar no banco
        user.setPassword(passwordEncoder.encode(dto.password()));

        User salvo = userRepository.save(user);

        // Devolve o DTO sem expor a palavra-passe
        return new UserResponseDTO(salvo.getId(), salvo.getEmail(), salvo.getDataCriacao());
    }
}