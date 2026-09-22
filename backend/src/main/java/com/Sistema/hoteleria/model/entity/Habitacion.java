package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "habitaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String numero; // Ej: "101", "205"

    @Column(nullable = false)
    private Integer piso; // 1, 2, 3...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoHabitacion tipo;

    @Column(name = "precio_por_noche", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioPorNoche;

    @Column(nullable = false)
    private Integer capacidad; // Cantidad max de personas

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoHabitacion estado;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 255)
    private String caracteristicas; // "Wifi, TV Cable, A/C, Jacuzzi, Vista Piscina"

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = EstadoHabitacion.DISPONIBLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
