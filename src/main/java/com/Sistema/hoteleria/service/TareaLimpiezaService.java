package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.TareaLimpiezaDTO;
import com.Sistema.hoteleria.dto.TareaLimpiezaRequestDTO;

import java.util.List;

public interface TareaLimpiezaService {
    List<TareaLimpiezaDTO> obtenerTodas();
    List<TareaLimpiezaDTO> obtenerPendientes();
    List<TareaLimpiezaDTO> obtenerPorEmpleado(Long empleadoId);
    TareaLimpiezaDTO obtenerPorId(Long id);
    TareaLimpiezaDTO crear(TareaLimpiezaRequestDTO dto);
    TareaLimpiezaDTO asignarEmpleado(Long tareaId, Long empleadoId);
    TareaLimpiezaDTO iniciarLimpieza(Long tareaId);
    TareaLimpiezaDTO completarLimpieza(Long tareaId);
    void eliminar(Long id);
}
