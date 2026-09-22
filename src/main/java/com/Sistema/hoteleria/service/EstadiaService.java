package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.*;

import java.util.List;

public interface EstadiaService {
    List<EstadiaDTO> obtenerTodas();
    List<EstadiaDTO> obtenerActivas();
    EstadiaDTO obtenerPorId(Long id);
    EstadiaDTO obtenerPorHabitacionActiva(Long habitacionId);
    EstadiaDTO realizarCheckIn(CheckInRequestDTO dto);
    CheckOutResponseDTO realizarCheckOut(Long estadiaId, CheckOutRequestDTO dto);
    EstadiaDTO agregarConsumo(Long estadiaId, ConsumoDTO dto);
    EstadiaDTO registrarPago(Long estadiaId, PagoDTO dto);
}
