package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.EstadoRecomendacion;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Recomendación de subida de precio y su decisión. Queda como historial para decisiones futuras:
 * quién decidió, por qué y qué ocupación real se logró.
 */
@Entity
@Table(name = "recomendaciones_tarifa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecomendacionTarifa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false)
    private Integer porcentaje;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    @Column(columnDefinition = "TEXT")
    private String justificacion;

    /** "IA" o "REGLAS" según quién redactó la justificación. */
    @Column(length = 10)
    private String fuente;

    @Column(name = "ocupacion_prevista")
    private Double ocupacionPrevista;

    @Column(name = "ocupacion_real")
    private Double ocupacionReal;

    @Column(length = 500)
    private String eventos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoRecomendacion estado;

    @Column(name = "porcentaje_aplicado")
    private Integer porcentajeAplicado;

    @Column(name = "comentario_decision", length = 500)
    private String comentarioDecision;

    @Column(name = "decidido_por", length = 50)
    private String decididoPor;

    @Column(name = "fecha_decision")
    private LocalDateTime fechaDecision;

    @Column(name = "generado_por", length = 50)
    private String generadoPor;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void alCrear() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (estado == null) estado = EstadoRecomendacion.PENDIENTE;
    }
}
