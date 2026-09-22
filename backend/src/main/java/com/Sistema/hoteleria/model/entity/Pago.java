package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.MetodoPago;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estadia_id", nullable = false)
    private Estadia estadia;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false, length = 30)
    private MetodoPago metodoPago;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;

    @Column(name = "nro_operacion", length = 50)
    private String nroOperacion; // Código de transacción Yape/Plin/POS Visa

    @Column(name = "tipo_comprobante", length = 30)
    private String tipoComprobante; // "BOLETA", "FACTURA", "NOTA_VENTA"

    @Column(name = "nro_comprobante", length = 30)
    private String nroComprobante; // Ej: "B001-000123"

    @Column(length = 255)
    private String notas;

    @PrePersist
    protected void onCreate() {
        if (this.fechaPago == null) {
            this.fechaPago = LocalDateTime.now();
        }
    }
}
