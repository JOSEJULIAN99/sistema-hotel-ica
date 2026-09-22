package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.PagoDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PagoService {
    List<PagoDTO> obtenerPorEstadia(Long estadiaId);
    List<PagoDTO> obtenerPorRango(LocalDateTime desde, LocalDateTime hasta);
    BigDecimal calcularTotalIngresosEnRango(LocalDateTime desde, LocalDateTime hasta);
    PagoDTO registrarPago(PagoDTO dto);
    void eliminarPago(Long id);
}
