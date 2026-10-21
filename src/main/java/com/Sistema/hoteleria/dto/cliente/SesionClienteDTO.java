package com.Sistema.hoteleria.dto.cliente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SesionClienteDTO {
    private String token;
    private String tipo;
    private long expiraEnMinutos;
    private PerfilClienteDTO cliente;
}
