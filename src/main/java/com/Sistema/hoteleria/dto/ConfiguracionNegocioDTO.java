package com.Sistema.hoteleria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionNegocioDTO {

    @NotBlank(message = "El nombre del hotel es obligatorio")
    @Size(max = 120)
    private String nombreHotel;

    @Size(max = 200)
    private String direccion;

    @Size(max = 40)
    private String telefono;

    @Size(max = 120)
    private String email;

    @Size(max = 10)
    private String horaCheckIn;

    @Size(max = 10)
    private String horaCheckOut;

    @Size(max = 4000, message = "La descripción admite hasta 4000 caracteres")
    private String descripcion;

    @Size(max = 4000, message = "Servicios admite hasta 4000 caracteres")
    private String servicios;

    @Size(max = 4000, message = "Políticas admite hasta 4000 caracteres")
    private String politicas;

    @Size(max = 4000, message = "Turismo admite hasta 4000 caracteres")
    private String turismo;

    @Size(max = 4000, message = "Las reglas admiten hasta 4000 caracteres")
    private String reglasAsistente;

    private String actualizadoPor;
    private LocalDateTime updatedAt;
}
