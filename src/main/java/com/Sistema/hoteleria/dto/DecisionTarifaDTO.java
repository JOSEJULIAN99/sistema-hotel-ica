package com.Sistema.hoteleria.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DecisionTarifaDTO {

    @NotNull(message = "Indique si aprueba o rechaza")
    private Boolean aprobar;

    /** Opcional: porcentaje distinto al sugerido. */
    @Min(0) @Max(100)
    private Integer porcentaje;

    @Size(max = 500, message = "El comentario admite hasta 500 caracteres")
    private String comentario;
}
