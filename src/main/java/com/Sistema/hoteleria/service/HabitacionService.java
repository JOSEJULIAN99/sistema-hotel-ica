package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.HabitacionDTO;
import com.Sistema.hoteleria.dto.HabitacionRequestDTO;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;

import java.time.LocalDate;
import java.util.List;

public interface HabitacionService {
    List<HabitacionDTO> obtenerTodas();
    HabitacionDTO obtenerPorId(Long id);
    HabitacionDTO obtenerPorNumero(String numero);
    List<HabitacionDTO> filtrarPorEstado(EstadoHabitacion estado);
    List<HabitacionDTO> filtrarPorTipo(TipoHabitacion tipo);
    List<HabitacionDTO> filtrarPorPiso(Integer piso);
    List<HabitacionDTO> buscarDisponibles(LocalDate checkIn, LocalDate checkOut);
    HabitacionDTO crear(HabitacionRequestDTO dto);
    HabitacionDTO actualizar(Long id, HabitacionRequestDTO dto);
    HabitacionDTO cambiarEstado(Long id, EstadoHabitacion nuevoEstado);
    void eliminar(Long id);
}
