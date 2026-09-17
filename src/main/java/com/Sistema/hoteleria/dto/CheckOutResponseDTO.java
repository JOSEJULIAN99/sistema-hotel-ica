package com.Sistema.hoteleria.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckOutResponseDTO {
    private Long estadiaId;
    private String habitacionNumero;
    private String huespedNombre;
    private LocalDateTime fechaIngreso;
    private LocalDateTime fechaSalidaReal;
    private BigDecimal totalHospedaje;
    private BigDecimal totalConsumos;
    private BigDecimal totalPagar;
    private BigDecimal totalPagado;
    private BigDecimal saldoFinal;
    private String estadoHabitacionActual; // "LIMPIEZA"
    private String mensaje;
}
