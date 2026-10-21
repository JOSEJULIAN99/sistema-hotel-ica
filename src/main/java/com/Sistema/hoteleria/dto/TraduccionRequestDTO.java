package com.Sistema.hoteleria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TraduccionRequestDTO {

    @NotBlank(message = "Escriba el texto a traducir")
    @Size(max = 2000, message = "El texto admite hasta 2000 caracteres")
    private String texto;

    /** Idioma de destino: "español", "inglés", "portugués", "francés", "alemán", "italiano"... */
    @NotBlank(message = "Indique el idioma de destino")
    @Size(max = 40)
    private String idiomaDestino;
}
