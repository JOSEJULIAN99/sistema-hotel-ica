package com.Sistema.hoteleria.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Base de conocimiento del negocio que el administrador mantiene desde el panel.
 * La IA solo responde con esta información; hay una única fila (id = 1).
 */
@Entity
@Table(name = "configuracion_negocio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionNegocio {

    @Id
    private Long id;

    @Column(name = "nombre_hotel", nullable = false, length = 120)
    private String nombreHotel;

    @Column(length = 200)
    private String direccion;

    @Column(length = 40)
    private String telefono;

    @Column(length = 120)
    private String email;

    @Column(name = "hora_check_in", length = 10)
    private String horaCheckIn;

    @Column(name = "hora_check_out", length = 10)
    private String horaCheckOut;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(columnDefinition = "TEXT")
    private String servicios;

    @Column(columnDefinition = "TEXT")
    private String politicas;

    @Column(columnDefinition = "TEXT")
    private String turismo;

    @Column(name = "reglas_asistente", columnDefinition = "TEXT")
    private String reglasAsistente;

    // ---- Reglas del motor de tarifas (porcentajes sobre la tarifa base) ----
    @Column(name = "umbral_ocupacion_alta")
    private Integer umbralOcupacionAlta;

    @Column(name = "aumento_ocupacion_alta")
    private Integer aumentoOcupacionAlta;

    @Column(name = "aumento_feriado")
    private Integer aumentoFeriado;

    @Column(name = "aumento_festividad")
    private Integer aumentoFestividad;

    @Column(name = "aumento_evento")
    private Integer aumentoEvento;

    @Column(name = "aumento_temporada_alta")
    private Integer aumentoTemporadaAlta;

    @Column(name = "aumento_maximo")
    private Integer aumentoMaximo;

    @Column(name = "horizonte_dias")
    private Integer horizonteDias;

    @Column(name = "actualizado_por", length = 50)
    private String actualizadoPor;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void alGuardar() {
        this.updatedAt = LocalDateTime.now();
    }
}
