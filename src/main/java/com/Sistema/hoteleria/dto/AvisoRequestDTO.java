package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.model.enums.TipoAviso;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AvisoRequestDTO {

    @NotNull(message = "El tipo de aviso es obligatorio")
    private TipoAviso tipo;

    @NotBlank(message = "Escriba el mensaje")
    @Size(max = 300, message = "El aviso admite hasta 300 caracteres")
    private String mensaje;

    @Size(max = 10)
    private String habitacionNumero;

    /** Vacío = todo el personal. */
    private RolUsuario rolDestino;
}
