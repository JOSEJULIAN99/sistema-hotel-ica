package com.Sistema.hoteleria.model.entity;

import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "estadias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Estadia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservacion_id")
    private Reservacion reservacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "huesped_id", nullable = false)
    private Huesped huesped;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_salida_esperada", nullable = false)
    private LocalDate fechaSalidaEsperada;

    @Column(name = "fecha_salida_real")
    private LocalDateTime fechaSalidaReal;

    @Column(name = "total_hospedaje", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalHospedaje;

    @Column(name = "total_consumos", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalConsumos = BigDecimal.ZERO;

    @Column(name = "descuento", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(name = "total_pagar", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPagar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoEstadia estado;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @OneToMany(mappedBy = "estadia", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ConsumoServicio> consumos = new ArrayList<>();

    @OneToMany(mappedBy = "estadia", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Pago> pagos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.fechaIngreso == null) {
            this.fechaIngreso = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = EstadoEstadia.ACTIVA;
        }
        if (this.totalConsumos == null) {
            this.totalConsumos = BigDecimal.ZERO;
        }
        if (this.descuento == null) {
            this.descuento = BigDecimal.ZERO;
        }
        recalcularTotal();
    }

    public void recalcularTotal() {
        if (this.totalHospedaje == null) {
            this.totalHospedaje = BigDecimal.ZERO;
        }
        if (this.totalConsumos == null) {
            this.totalConsumos = BigDecimal.ZERO;
        }
        if (this.descuento == null) {
            this.descuento = BigDecimal.ZERO;
        }
        this.totalPagar = this.totalHospedaje.add(this.totalConsumos).subtract(this.descuento);
        if (this.totalPagar.compareTo(BigDecimal.ZERO) < 0) {
            this.totalPagar = BigDecimal.ZERO;
        }
    }

    public BigDecimal getTotalPagado() {
        if (pagos == null || pagos.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return pagos.stream()
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getSaldoPendiente() {
        return (totalPagar != null ? totalPagar : BigDecimal.ZERO).subtract(getTotalPagado());
    }
}
