package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.ConsumoDTO;

import java.util.List;

public interface ConsumoServicioService {
    List<ConsumoDTO> obtenerPorEstadia(Long estadiaId);
    ConsumoDTO registrarConsumo(ConsumoDTO dto);
    void eliminarConsumo(Long id);
}
