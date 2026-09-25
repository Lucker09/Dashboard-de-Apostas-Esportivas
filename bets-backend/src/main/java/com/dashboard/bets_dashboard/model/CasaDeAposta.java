package com.dashboard.bets_dashboard.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "casas_de_aposta")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CasaDeAposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cor; // Ex: Código HEX (#FF5733)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}