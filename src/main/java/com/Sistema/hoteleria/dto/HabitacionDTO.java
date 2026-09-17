package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitacionDTO {
    private Long id;
    private String numero;
    private Integer piso;
    private TipoHabitacion tipo;
    private BigDecimal precioPorNoche;
    private Integer capacidad;
    private EstadoHabitacion estado;
    private String descripcion;
    private String caracteristicas;
    private String imagenUrl;
}
