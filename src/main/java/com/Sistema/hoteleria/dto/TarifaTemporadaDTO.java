package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TarifaTemporadaDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    /** % sobre la tarifa base: positivo sube, negativo es promoción. */
    @NotNull(message = "El porcentaje es obligatorio")
    @Min(value = -50, message = "La promoción máxima es -50 %")
    @Max(value = 100, message = "El aumento máximo es +100 %")
    private Integer porcentaje;

    /** Vacío = todas las habitaciones. */
    private TipoHabitacion tipoHabitacion;
}
