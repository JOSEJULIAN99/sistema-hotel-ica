package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.HuespedDTO;

import java.util.List;

public interface HuespedService {
    List<HuespedDTO> obtenerTodos();
    HuespedDTO obtenerPorId(Long id);
    HuespedDTO obtenerPorDocumento(String numeroDocumento);
    List<HuespedDTO> buscar(String filtro);
    HuespedDTO crear(HuespedDTO dto);
    HuespedDTO actualizar(Long id, HuespedDTO dto);
    void eliminar(Long id);
}
