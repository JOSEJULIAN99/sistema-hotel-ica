package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.RolUsuario;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    private Long id;
    private String username;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private RolUsuario rol;
    private String turno;
    private Boolean activo;
}
