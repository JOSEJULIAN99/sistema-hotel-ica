package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.TipoEvento;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Feriados, festividades de Ica y eventos que el administrador registra para decidir precios. */
@Entity
@Table(name = "eventos_calendario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoCalendario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoEvento tipo;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    /** % de aumento sugerido; si es null se usa la regla del tipo de evento. */
    @Column(name = "porcentaje_sugerido")
    private Integer porcentajeSugerido;

    @Column(length = 500)
    private String descripcion;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "creado_por", length = 50)
    private String creadoPor;

    public boolean cubre(LocalDate dia) {
        return !dia.isBefore(fechaInicio) && !dia.isAfter(fechaFin);
    }
}
