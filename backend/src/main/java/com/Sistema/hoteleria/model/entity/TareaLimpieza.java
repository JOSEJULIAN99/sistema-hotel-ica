package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.EstadoLimpieza;
import com.Sistema.hoteleria.model.enums.PrioridadLimpieza;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tareas_limpieza")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TareaLimpieza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empleado_id")
    private Usuario empleadoAsignado;

    @Column(name = "tipo_limpieza", length = 50)
    private String tipoLimpieza; // "CHECKOUT", "RUTINARIA", "PROFUNDA"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoLimpieza estado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PrioridadLimpieza prioridad;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = EstadoLimpieza.PENDIENTE;
        }
        if (this.prioridad == null) {
            this.prioridad = PrioridadLimpieza.MEDIA;
        }
        if (this.tipoLimpieza == null) {
            this.tipoLimpieza = "RUTINARIA";
        }
    }
}
