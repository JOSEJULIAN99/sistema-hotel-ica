package com.Sistema.hoteleria.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservacionRequestDTO {

    @NotNull(message = "El ID del huésped es obligatorio")
    private Long huespedId;

    @NotNull(message = "El ID de la habitación es obligatorio")
    private Long habitacionId;

    @NotNull(message = "La fecha de entrada es obligatoria")
    @FutureOrPresent(message = "La fecha de entrada debe ser hoy o una fecha futura")
    private LocalDate fechaEntrada;

    @NotNull(message = "La fecha de salida es obligatoria")
    private LocalDate fechaSalida;

    @NotNull(message = "El número de personas es obligatorio")
    @Min(value = 1, message = "Debe haber al menos 1 persona")
    private Integer numeroPersonas;

    @NotNull(message = "El precio total es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio total debe ser mayor a 0")
    private BigDecimal precioTotal;

    private BigDecimal adelanto;

    private String observaciones;
}
