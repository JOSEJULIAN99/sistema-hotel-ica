package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.DashboardStatsDTO;
import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.EstadoLimpieza;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.repository.*;
import com.Sistema.hoteleria.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final HabitacionRepository habitacionRepository;
    private final EstadiaRepository estadiaRepository;
    private final ReservacionRepository reservacionRepository;
    private final TareaLimpiezaRepository tareaLimpiezaRepository;
    private final PagoRepository pagoRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO obtenerEstadisticas() {
        long totalHabitaciones = habitacionRepository.count();
        long disponibles = habitacionRepository.countByEstado(EstadoHabitacion.DISPONIBLE);
        long ocupadas = habitacionRepository.countByEstado(EstadoHabitacion.OCUPADA);
        long enLimpieza = habitacionRepository.countByEstado(EstadoHabitacion.LIMPIEZA);
        long enMantenimiento = habitacionRepository.countByEstado(EstadoHabitacion.MANTENIMIENTO);
        long reservadas = habitacionRepository.countByEstado(EstadoHabitacion.RESERVADA);

        double porcentajeOcupacion = totalHabitaciones > 0
                ? ((double) ocupadas / totalHabitaciones) * 100.0
                : 0.0;

        LocalDate hoy = LocalDate.now();
        long checkInsHoy = reservacionRepository.countCheckInsProgramadosHoy(hoy);
        long checkOutsHoy = estadiaRepository.findCheckOutsProgramadosHoy(hoy).size();
        long estadiasActivas = estadiaRepository.countByEstado(EstadoEstadia.ACTIVA);
        long reservacionesPendientes = reservacionRepository.findByEstado(EstadoReservacion.PENDIENTE).size()
                + reservacionRepository.findByEstado(EstadoReservacion.CONFIRMADA).size();
        long tareasLimpiezaPendientes = tareaLimpiezaRepository.countByEstado(EstadoLimpieza.PENDIENTE)
                + tareaLimpiezaRepository.countByEstado(EstadoLimpieza.EN_PROCESO);

        LocalDateTime inicioHoy = hoy.atStartOfDay();
        LocalDateTime finHoy = hoy.atTime(LocalTime.MAX);
        BigDecimal ingresosHoy = pagoRepository.sumTotalIngresosEnRango(inicioHoy, finHoy);
        if (ingresosHoy == null) ingresosHoy = BigDecimal.ZERO;

        LocalDateTime inicioMes = hoy.withDayOfMonth(1).atStartOfDay();
        BigDecimal ingresosMes = pagoRepository.sumTotalIngresosEnRango(inicioMes, finHoy);
        if (ingresosMes == null) ingresosMes = BigDecimal.ZERO;

        return DashboardStatsDTO.builder()
                .totalHabitaciones(totalHabitaciones)
                .habitacionesDisponibles(disponibles)
                .habitacionesOcupadas(ocupadas)
                .habitacionesEnLimpieza(enLimpieza)
                .habitacionesEnMantenimiento(enMantenimiento)
                .habitacionesReservadas(reservadas)
                .porcentajeOcupacion(Math.round(porcentajeOcupacion * 100.0) / 100.0)
                .checkInsHoy(checkInsHoy)
                .checkOutsHoy(checkOutsHoy)
                .estadiasActivas(estadiasActivas)
                .reservacionesPendientes(reservacionesPendientes)
                .tareasLimpiezaPendientes(tareasLimpiezaPendientes)
                .ingresosHoy(ingresosHoy)
                .ingresosMes(ingresosMes)
                .build();
    }
}
