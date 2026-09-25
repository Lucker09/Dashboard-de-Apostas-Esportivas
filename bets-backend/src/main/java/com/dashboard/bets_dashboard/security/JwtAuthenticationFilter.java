package com.dashboard.bets_dashboard.security;

import com.dashboard.bets_dashboard.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        final String userEmail;

        try {
            userEmail = jwtUtil.extrairEmail(token);
            System.out.println(">>> E-MAIL EXTRAÍDO COM SUCESSO: " + userEmail);
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println(">>> ERRO DE VALIDAÇÃO DO TOKEN (JwtException): " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            var userOptional = userRepository.findByEmail(userEmail);
            System.out.println(">>> UTILIZADOR ENCONTRADO NA BASE DE DADOS? " + userOptional.isPresent());

            if (userOptional.isPresent() && jwtUtil.validarToken(token, userEmail)) {
                var user = userOptional.get();
                var authToken = new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println(">>> AUTENTICAÇÃO DEFINIDA COM SUCESSO PARA: " + userEmail);
            } else {
                System.out.println(">>> FALHA: O token não é válido ou o utilizador não bate certo.");
            }
        }

        filterChain.doFilter(request, response);
    }
}