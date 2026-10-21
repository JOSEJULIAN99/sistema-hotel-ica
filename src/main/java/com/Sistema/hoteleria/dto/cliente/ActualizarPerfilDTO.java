package com.Sistema.hoteleria.dto.cliente;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** El cliente puede actualizar sus datos de contacto; nombre y documento los corrige recepción. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarPerfilDTO {
    private String telefono;
    private String nacionalidad;
    private String ciudadProcedencia;
}
