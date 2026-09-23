package com.dashboard.bets_dashboard.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "apostas")
@Getter
@Setter
@NoArgsConstructor
public class Aposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String descricao;

    @Column(name = "valor_apostado",  nullable = false, precision = 10, scale = 2)
    private BigDecimal valorApostado;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal odd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAposta status = StatusAposta.PENDENTE;

    @Column(name = "valor_resgatado", precision = 10, scale = 2)
    private BigDecimal valorResgatado;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_liquidacao")
    private LocalDateTime dataLiquidacao;
}
