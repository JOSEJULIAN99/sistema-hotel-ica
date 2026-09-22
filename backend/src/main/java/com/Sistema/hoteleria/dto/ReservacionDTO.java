package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservacionDTO {
    private Long id;
    private String codigoReserva;
    private HuespedDTO huesped;
    private HabitacionDTO habitacion;
    private LocalDate fechaEntrada;
    private LocalDate fechaSalida;
    private Integer numeroPersonas;
    private BigDecimal precioTotal;
    private BigDecimal adelanto;
    private EstadoReservacion estado;
    private String observaciones;
    private LocalDateTime createdAt;
}
