package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.TipoDocumento;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "huespedes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Huesped {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nombres;

    @Column(nullable = false, length = 80)
    private String apellidos;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", nullable = false, length = 30)
    private TipoDocumento tipoDocumento;

    @Column(name = "numero_documento", nullable = false, unique = true, length = 30)
    private String numeroDocumento;

    @Column(length = 20)
    private String telefono;

    @Column(length = 100)
    private String email;

    @Column(length = 60)
    private String nacionalidad; // Ej: "Peruana", "Chilena", "Argentina", "Española"

    @Column(length = 150)
    private String ciudadProcedencia; // Ej: "Lima", "Arequipa", "Cusco"

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.nacionalidad == null) {
            this.nacionalidad = "Peruana";
        }
    }

    public String getNombreCompleto() {
        return (this.nombres != null ? this.nombres : "") + " " + (this.apellidos != null ? this.apellidos : "");
    }
}
