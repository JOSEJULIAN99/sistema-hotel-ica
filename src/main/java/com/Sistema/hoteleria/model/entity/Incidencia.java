package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.EstadoIncidencia;
import com.Sistema.hoteleria.model.enums.PrioridadLimpieza;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Incidencia de mantenimiento de una habitación (historial por habitación). */
@Entity
@Table(name = "incidencias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;

    @Column(nullable = false, length = 500)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrioridadLimpieza prioridad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoIncidencia estado;

    /** Si es grave, la habitación pasa a MANTENIMIENTO hasta resolverse. */
    @Builder.Default
    @Column(name = "bloquea_habitacion", nullable = false)
    private Boolean bloqueaHabitacion = false;

    @Column(name = "reportado_por", length = 50)
    private String reportadoPor;

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDateTime fechaReporte;

    @Column(name = "atendido_por", length = 50)
    private String atendidoPor;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @Column(length = 500)
    private String solucion;

    @PrePersist
    protected void alCrear() {
        if (fechaReporte == null) fechaReporte = LocalDateTime.now();
        if (estado == null) estado = EstadoIncidencia.ABIERTA;
        if (prioridad == null) prioridad = PrioridadLimpieza.MEDIA;
    }
}
