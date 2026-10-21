package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Ajuste de precio aprobado para un rango de fechas; se aplica a las reservas nuevas. */
@Entity
@Table(name = "tarifas_temporada")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TarifaTemporada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    /** % sobre la tarifa base (puede ser negativo para una promoción). */
    @Column(nullable = false)
    private Integer porcentaje;

    /** null = todas las habitaciones. */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_habitacion", length = 30)
    private TipoHabitacion tipoHabitacion;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activa = true;

    @Column(name = "recomendacion_id")
    private Long recomendacionId;

    @Column(name = "creado_por", length = 50)
    private String creadoPor;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void alCrear() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
    }

    public boolean aplica(LocalDate noche, TipoHabitacion tipo) {
        return Boolean.TRUE.equals(activa)
                && !noche.isBefore(fechaInicio) && !noche.isAfter(fechaFin)
                && (tipoHabitacion == null || tipoHabitacion == tipo);
    }
}
