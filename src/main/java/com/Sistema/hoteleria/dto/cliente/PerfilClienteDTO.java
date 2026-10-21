package com.Sistema.hoteleria.dto.cliente;

import com.Sistema.hoteleria.model.enums.TipoDocumento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Datos que el cliente ve de su propia cuenta. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilClienteDTO {
    private Long id;
    private String email;
    private String nombres;
    private String apellidos;
    private String nombreCompleto;
    private TipoDocumento tipoDocumento;
    private String numeroDocumento;
    private String telefono;
    private String nacionalidad;
    private String ciudadProcedencia;
    /** Siempre CLIENTE: permite al frontend distinguir la sesión del personal. */
    private String rol;
}
