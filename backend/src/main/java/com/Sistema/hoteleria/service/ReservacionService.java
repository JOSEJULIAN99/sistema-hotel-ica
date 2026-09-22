package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.ReservacionDTO;
import com.Sistema.hoteleria.dto.ReservacionRequestDTO;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;

import java.time.LocalDate;
import java.util.List;

public interface ReservacionService {
    List<ReservacionDTO> obtenerTodas();
    ReservacionDTO obtenerPorId(Long id);
    ReservacionDTO obtenerPorCodigo(String codigo);
    List<ReservacionDTO> filtrarPorEstado(EstadoReservacion estado);
    List<ReservacionDTO> obtenerPorHuesped(Long huespedId);
    List<ReservacionDTO> obtenerPorRangoFechas(LocalDate desde, LocalDate hasta);
    ReservacionDTO crear(ReservacionRequestDTO dto);
    ReservacionDTO confirmar(Long id);
    ReservacionDTO cancelar(Long id, String motivo);
    void eliminar(Long id);
}
