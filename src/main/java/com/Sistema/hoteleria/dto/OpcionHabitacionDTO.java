package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpcionHabitacionDTO {
    private Long habitacionId;
    private String numero;
    private TipoHabitacion tipo;
    private Integer capacidad;
    private BigDecimal precioPorNoche;
    private BigDecimal totalEstimado;
    private String caracteristicas;
    private String motivo;
}
