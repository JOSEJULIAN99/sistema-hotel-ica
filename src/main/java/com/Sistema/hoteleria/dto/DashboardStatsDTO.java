package com.Sistema.hoteleria.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalHabitaciones;
    private long habitacionesDisponibles;
    private long habitacionesOcupadas;
    private long habitacionesEnLimpieza;
    private long habitacionesEnMantenimiento;
    private long habitacionesReservadas;
    private double porcentajeOcupacion;

    private long checkInsHoy;
    private long checkOutsHoy;
    private long estadiasActivas;
    private long reservacionesPendientes;
    private long tareasLimpiezaPendientes;

    private BigDecimal ingresosHoy;
    private BigDecimal ingresosMes;
}
