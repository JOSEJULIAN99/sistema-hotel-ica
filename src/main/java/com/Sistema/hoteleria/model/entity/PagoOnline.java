package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.EstadoPagoOnline;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Cobro en línea con Mercado Pago (link de pago). Se registra como Pago solo cuando Mercado Pago lo aprueba. */
@Entity
@Table(name = "pagos_online")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoOnline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estadia_id")
    private Estadia estadia;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservacion_id")
    private Reservacion reservacion;

    @Column(nullable = false, length = 200)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "preferencia_id", length = 120)
    private String preferenciaId;

    @Column(name = "url_pago", length = 600)
    private String urlPago;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPagoOnline estado;

    @Column(name = "mp_payment_id", length = 40)
    private String mpPaymentId;

    @Column(name = "mp_estado_detalle", length = 80)
    private String mpEstadoDetalle;

    @Column(name = "medio_pago", length = 40)
    private String medioPago;

    @Column(name = "creado_por", length = 50)
    private String creadoPor;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void alCrear() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = fechaCreacion;
        if (estado == null) estado = EstadoPagoOnline.PENDIENTE;
    }

    @PreUpdate
    protected void alActualizar() {
        fechaActualizacion = LocalDateTime.now();
    }

    /** Referencia que viaja a Mercado Pago y vuelve en la notificación. */
    public String referenciaExterna() {
        return "PO-" + id;
    }

    public Long getEstadiaId() {
        return estadia != null ? estadia.getId() : null;
    }

    public Long getReservacionId() {
        return reservacion != null ? reservacion.getId() : null;
    }
}
