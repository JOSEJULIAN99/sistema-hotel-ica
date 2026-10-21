package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.PagoDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import com.Sistema.hoteleria.model.entity.Estadia;
import com.Sistema.hoteleria.model.entity.Pago;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.PagoRepository;
import com.Sistema.hoteleria.service.PagoService;
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
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final EstadiaRepository estadiaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PagoDTO> obtenerPorEstadia(Long estadiaId) {
        return pagoRepository.findByEstadiaId(estadiaId).stream()
                .map(EntityMapper::toPagoDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagoDTO> obtenerPorRango(LocalDateTime desde, LocalDateTime hasta) {
        return pagoRepository.findPagosEnRango(desde, hasta).stream()
                .map(EntityMapper::toPagoDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalIngresosEnRango(LocalDateTime desde, LocalDateTime hasta) {
        BigDecimal total = pagoRepository.sumTotalIngresosEnRango(desde, hasta);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    @Transactional
    public PagoDTO registrarPago(PagoDTO dto) {
        Estadia estadia = estadiaRepository.findById(dto.getEstadiaId())
                .orElseThrow(() -> new ResourceNotFoundException("Estadía", "id", dto.getEstadiaId()));

        if (estadia.getEstado() != EstadoEstadia.ACTIVA) {
            throw new BadRequestException("No se pueden registrar pagos en una estadía que no está activa");
        }

        Pago pago = Pago.builder()
                .estadia(estadia)
                .monto(dto.getMonto())
                .metodoPago(dto.getMetodoPago())
                .fechaPago(dto.getFechaPago() != null ? dto.getFechaPago() : LocalDateTime.now())
                .nroOperacion(dto.getNroOperacion())
                .tipoComprobante(dto.getTipoComprobante() != null ? dto.getTipoComprobante() : "BOLETA")
                .nroComprobante(dto.getNroComprobante())
                .notas(dto.getNotas())
                .build();

        Pago guardado = pagoRepository.save(pago);
        estadia.getPagos().add(guardado);
        return EntityMapper.toPagoDTO(guardado);
    }

    @Override
    @Transactional
    public void eliminarPago(Long id) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago", "id", id));
        Estadia estadia = pago.getEstadia();
        if (estadia.getEstado() != EstadoEstadia.ACTIVA) {
            throw new BadRequestException("No se puede eliminar un pago de una estadía cerrada; registre una nota de corrección");
        }
        estadia.getPagos().remove(pago);
        pagoRepository.delete(pago);
    }
}
