package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.EstadoLimpieza;
import com.Sistema.hoteleria.model.enums.PrioridadLimpieza;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TareaLimpiezaDTO {
    private Long id;
    private HabitacionDTO habitacion;
    private UsuarioDTO empleadoAsignado;
    private String tipoLimpieza;
    private EstadoLimpieza estado;
    private PrioridadLimpieza prioridad;
    private String observaciones;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}
