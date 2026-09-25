package com.dashboard.bets_dashboard.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "apostas")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Aposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorApostado;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal odd;

    @Column(precision = 10, scale = 2)
    private BigDecimal retornoPotencial;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAposta status; // Ex: PENDENTE, GREEN, RED, CASHOUT, ANULADA

    @Column(precision = 10, scale = 2)
    private BigDecimal lucroOuPrejuizo;

    // Campos adicionados para suportar a liquidação e cálculo no serviço:
    @Column(precision = 10, scale = 2)
    private BigDecimal valorResgatado;

    @Column(nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    private LocalDateTime dataLiquidacao;

    // Relação Obrigatória com a Casa de Aposta (Many-to-One)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "casa_de_aposta_id", nullable = false)
    private CasaDeAposta casaDeAposta;

    // Relação Many-to-Many com Tags (Opcional)
    @ManyToMany
    @JoinTable(
            name = "aposta_tags",
            joinColumns = @JoinColumn(name = "aposta_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}