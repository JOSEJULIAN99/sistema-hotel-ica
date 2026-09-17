package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.MetodoPago;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInRequestDTO {

    // Opcional: si viene de una reservación previa
    private Long reservacionId;

    // Si es check-in directo (walk-in sin reserva previa)
    private Long huespedId;
    private Long habitacionId;
    private LocalDate fechaSalidaEsperada;
    private BigDecimal totalHospedaje;

    // Pago de adelanto o pago inicial opcional durante el check-in
    private BigDecimal pagoInicial;
    private MetodoPago metodoPagoInicial;
    private String nroOperacionInicial;

    private String observaciones;
}
