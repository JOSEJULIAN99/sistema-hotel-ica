package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.TipoEvento;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoDTO {
    private Long id;

    @NotBlank(message = "El nombre del evento es obligatorio")
    @Size(max = 120)
    private String nombre;

    @NotNull(message = "El tipo de evento es obligatorio")
    private TipoEvento tipo;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    /** Opcional: si se deja vacío se usa la regla del tipo. */
    @Min(0) @Max(100)
    private Integer porcentajeSugerido;

    @Size(max = 500)
    private String descripcion;

    private Boolean activo;
    private String creadoPor;
}
