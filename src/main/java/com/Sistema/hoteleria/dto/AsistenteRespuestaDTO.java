package com.Sistema.hoteleria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Respuesta del asistente. "fuente" indica si el texto lo redactó el modelo de IA ("IA")
 * o las reglas del sistema ("REGLAS"). Los datos siempre vienen de la base de datos.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsistenteRespuestaDTO<T> {
    private String fuente;
    private String mensaje;
    private T datos;
}
