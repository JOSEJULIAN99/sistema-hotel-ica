package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitacionRequestDTO {

    @NotBlank(message = "El número de habitación es obligatorio")
    private String numero;

    @NotNull(message = "El piso es obligatorio")
    @Min(value = 1, message = "El piso debe ser al menos 1")
    private Integer piso;

    @NotNull(message = "El tipo de habitación es obligatorio")
    private TipoHabitacion tipo;

    @NotNull(message = "El precio por noche es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    private BigDecimal precioPorNoche;

    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad mínima es 1 persona")
    private Integer capacidad;

    private EstadoHabitacion estado;

    private String descripcion;

    private String caracteristicas;

    private String imagenUrl;
}
