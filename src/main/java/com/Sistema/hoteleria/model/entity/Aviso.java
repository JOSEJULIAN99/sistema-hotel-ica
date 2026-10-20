package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.model.enums.TipoAviso;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Aviso instantáneo entre áreas (recepción → limpieza, limpieza → recepción). */
@Entity
@Table(name = "avisos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Aviso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoAviso tipo;

    @Column(nullable = false, length = 300)
    private String mensaje;

    @Column(name = "habitacion_numero", length = 10)
    private String habitacionNumero;

    /** null = para todo el personal. */
    @Enumerated(EnumType.STRING)
    @Column(name = "rol_destino", length = 30)
    private RolUsuario rolDestino;

    @Column(name = "creado_por", length = 50)
    private String creadoPor;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void alCrear() {
        if (fecha == null) fecha = LocalDateTime.now();
    }
}
