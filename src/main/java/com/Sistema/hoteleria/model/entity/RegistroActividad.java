package com.Sistema.hoteleria.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Auditoría: cada operación de escritura del API y cada error (RNF-10). */
@Entity
@Table(name = "registros_actividad", indexes = @Index(name = "idx_actividad_fecha", columnList = "fecha"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroActividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(length = 50)
    private String usuario;

    @Column(length = 30)
    private String rol;

    @Column(nullable = false, length = 10)
    private String metodo;

    @Column(nullable = false, length = 255)
    private String ruta;

    @Column(name = "estado_http", nullable = false)
    private Integer estadoHttp;

    @Column(name = "duracion_ms")
    private Long duracionMs;

    @Column(length = 60)
    private String ip;
}
