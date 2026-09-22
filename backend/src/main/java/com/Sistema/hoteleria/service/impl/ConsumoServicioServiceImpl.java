package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.ConsumoDTO;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.ConsumoServicio;
import com.Sistema.hoteleria.model.entity.Estadia;
import com.Sistema.hoteleria.repository.ConsumoServicioRepository;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.service.ConsumoServicioService;
import com.Sistema.hoteleria.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsumoServicioServiceImpl implements ConsumoServicioService {

    private final ConsumoServicioRepository consumoServicioRepository;
    private final EstadiaRepository estadiaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ConsumoDTO> obtenerPorEstadia(Long estadiaId) {
        return consumoServicioRepository.findByEstadiaId(estadiaId).stream()
                .map(EntityMapper::toConsumoDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConsumoDTO registrarConsumo(ConsumoDTO dto) {
        Estadia estadia = estadiaRepository.findById(dto.getEstadiaId())
                .orElseThrow(() -> new ResourceNotFoundException("Estadía", "id", dto.getEstadiaId()));

        BigDecimal subtotal = dto.getPrecioUnitario().multiply(BigDecimal.valueOf(dto.getCantidad()));

        ConsumoServicio consumo = ConsumoServicio.builder()
                .estadia(estadia)
                .nombreServicio(dto.getNombreServicio())
                .cantidad(dto.getCantidad())
                .precioUnitario(dto.getPrecioUnitario())
                .subtotal(subtotal)
                .fechaConsumo(LocalDateTime.now())
                .build();

        consumo = consumoServicioRepository.save(consumo);

        // Actualizar totales de estadía
        BigDecimal totalActual = estadia.getTotalConsumos() != null ? estadia.getTotalConsumos() : BigDecimal.ZERO;
        estadia.setTotalConsumos(totalActual.add(subtotal));
        estadia.recalcularTotal();
        estadiaRepository.save(estadia);

        return EntityMapper.toConsumoDTO(consumo);
    }

    @Override
    @Transactional
    public void eliminarConsumo(Long id) {
        ConsumoServicio consumo = consumoServicioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consumo", "id", id));

        Estadia estadia = consumo.getEstadia();
        estadia.setTotalConsumos(estadia.getTotalConsumos().subtract(consumo.getSubtotal()));
        estadia.recalcularTotal();
        estadiaRepository.save(estadia);

        consumoServicioRepository.delete(consumo);
    }
}
