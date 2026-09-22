package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.PrioridadLimpieza;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TareaLimpiezaRequestDTO {

    @NotNull(message = "El ID de la habitación es obligatorio")
    private Long habitacionId;

    private Long empleadoId; // Opcional al crear

    private String tipoLimpieza; // "CHECKOUT", "RUTINARIA", "PROFUNDA"

    private PrioridadLimpieza prioridad;

    private String observaciones;
}
