package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.PrioridadLimpieza;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class IncidenciaRequestDTO {

    @NotNull(message = "Seleccione la habitación")
    private Long habitacionId;

    @NotBlank(message = "Describa la incidencia")
    @Size(max = 500)
    private String descripcion;

    private PrioridadLimpieza prioridad;

    /** true si la habitación no puede usarse hasta repararla. */
    private Boolean bloqueaHabitacion;
}
