package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.*;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.*;
import com.Sistema.hoteleria.model.enums.*;
import com.Sistema.hoteleria.repository.*;
import com.Sistema.hoteleria.service.EstadiaService;
import com.Sistema.hoteleria.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstadiaServiceImpl implements EstadiaService {

    private final EstadiaRepository estadiaRepository;
    private final HabitacionRepository habitacionRepository;
    private final HuespedRepository huespedRepository;
    private final ReservacionRepository reservacionRepository;
    private final TareaLimpiezaRepository tareaLimpiezaRepository;
    private final PagoRepository pagoRepository;
    private final ConsumoServicioRepository consumoServicioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EstadiaDTO> obtenerTodas() {
        return estadiaRepository.findAll().stream()
                .map(EntityMapper::toEstadiaDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadiaDTO> obtenerActivas() {
        return estadiaRepository.findEstadiasActivas().stream()
                .map(EntityMapper::toEstadiaDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EstadiaDTO obtenerPorId(Long id) {
        Estadia e = estadiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estadía", "id", id));
        return EntityMapper.toEstadiaDTO(e);
    }

    @Override
    @Transactional(readOnly = true)
    public EstadiaDTO obtenerPorHabitacionActiva(Long habitacionId) {
        Estadia e = estadiaRepository.findByHabitacionIdAndEstado(habitacionId, EstadoEstadia.ACTIVA)
                .orElseThrow(() -> new ResourceNotFoundException("Estadía activa para habitación", "habitacionId", habitacionId));
        return EntityMapper.toEstadiaDTO(e);
    }

    @Override
    @Transactional
    public EstadiaDTO realizarCheckIn(CheckInRequestDTO dto) {
        Huesped huesped;
        Habitacion habitacion;
        Reservacion reservacion = null;
        LocalDate fechaSalida;
        BigDecimal totalHospedaje;

        if (dto.getReservacionId() != null) {
            reservacion = reservacionRepository.findById(dto.getReservacionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reservación", "id", dto.getReservacionId()));

            if (reservacion.getEstado() == EstadoReservacion.CANCELADA || reservacion.getEstado() == EstadoReservacion.COMPLETADA) {
                throw new BadRequestException("La reservación no está en estado válido para Check-In: " + reservacion.getEstado());
            }

            huesped = reservacion.getHuesped();
            habitacion = reservacion.getHabitacion();
            fechaSalida = reservacion.getFechaSalida();
            totalHospedaje = reservacion.getPrecioTotal();

            reservacion.setEstado(EstadoReservacion.EN_CURSO);
            reservacionRepository.save(reservacion);
        } else {
            if (dto.getHuespedId() == null || dto.getHabitacionId() == null || dto.getFechaSalidaEsperada() == null) {
                throw new BadRequestException("Para Check-In directo se requiere huespedId, habitacionId y fechaSalidaEsperada");
            }

            huesped = huespedRepository.findById(dto.getHuespedId())
                    .orElseThrow(() -> new ResourceNotFoundException("Huésped", "id", dto.getHuespedId()));

            habitacion = habitacionRepository.findById(dto.getHabitacionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Habitación", "id", dto.getHabitacionId()));

            if (habitacion.getEstado() == EstadoHabitacion.OCUPADA) {
                throw new BadRequestException("La habitación " + habitacion.getNumero() + " ya se encuentra ocupada");
            }
            if (habitacion.getEstado() == EstadoHabitacion.LIMPIEZA) {
                throw new BadRequestException("La habitación " + habitacion.getNumero() + " está en limpieza. Debe completarse la limpieza antes del Check-In");
            }
            if (habitacion.getEstado() == EstadoHabitacion.MANTENIMIENTO) {
                throw new BadRequestException("La habitación " + habitacion.getNumero() + " está en mantenimiento");
            }

            fechaSalida = dto.getFechaSalidaEsperada();
            if (dto.getTotalHospedaje() != null && dto.getTotalHospedaje().compareTo(BigDecimal.ZERO) > 0) {
                totalHospedaje = dto.getTotalHospedaje();
            } else {
                long dias = ChronoUnit.DAYS.between(LocalDate.now(), fechaSalida);
                if (dias <= 0) dias = 1;
                totalHospedaje = habitacion.getPrecioPorNoche().multiply(BigDecimal.valueOf(dias));
            }
        }

        // Marcar habitación como OCUPADA
        habitacion.setEstado(EstadoHabitacion.OCUPADA);
        habitacionRepository.save(habitacion);

        Estadia estadia = Estadia.builder()
                .reservacion(reservacion)
                .huesped(huesped)
                .habitacion(habitacion)
                .fechaIngreso(LocalDateTime.now())
                .fechaSalidaEsperada(fechaSalida)
                .totalHospedaje(totalHospedaje)
                .totalConsumos(BigDecimal.ZERO)
                .descuento(BigDecimal.ZERO)
                .estado(EstadoEstadia.ACTIVA)
                .observaciones(dto.getObservaciones())
                .build();

        estadia.recalcularTotal();
        estadia = estadiaRepository.save(estadia);

        // Si la reservación tenía adelanto previo, registrar como pago en la estadía
        if (reservacion != null && reservacion.getAdelanto() != null && reservacion.getAdelanto().compareTo(BigDecimal.ZERO) > 0) {
            Pago pagoAdelanto = Pago.builder()
                    .estadia(estadia)
                    .monto(reservacion.getAdelanto())
                    .metodoPago(MetodoPago.TRANSFERENCIA)
                    .fechaPago(LocalDateTime.now())
                    .tipoComprobante("ADELANTO_RESERVA")
                    .notas("Adelanto transferido desde reserva " + reservacion.getCodigoReserva())
                    .build();
            pagoRepository.save(pagoAdelanto);
        }

        // Si se realizó un pago inicial en el momento del Check-In
        if (dto.getPagoInicial() != null && dto.getPagoInicial().compareTo(BigDecimal.ZERO) > 0) {
            Pago pagoInicial = Pago.builder()
                    .estadia(estadia)
                    .monto(dto.getPagoInicial())
                    .metodoPago(dto.getMetodoPagoInicial() != null ? dto.getMetodoPagoInicial() : MetodoPago.EFECTIVO)
                    .fechaPago(LocalDateTime.now())
                    .nroOperacion(dto.getNroOperacionInicial())
                    .tipoComprobante("BOLETA")
                    .notas("Pago inicial de Check-In")
                    .build();
            pagoRepository.save(pagoInicial);
        }

        return EntityMapper.toEstadiaDTO(estadiaRepository.findById(estadia.getId()).orElse(estadia));
    }

    @Override
    @Transactional
    public CheckOutResponseDTO realizarCheckOut(Long estadiaId, CheckOutRequestDTO dto) {
        Estadia estadia = estadiaRepository.findById(estadiaId)
                .orElseThrow(() -> new ResourceNotFoundException("Estadía", "id", estadiaId));

        if (estadia.getEstado() != EstadoEstadia.ACTIVA) {
            throw new BadRequestException("La estadía ya fue finalizada o no está activa.");
        }

        // Registrar pago final si se envía
        if (dto != null && dto.getPagoFinal() != null && dto.getPagoFinal().compareTo(BigDecimal.ZERO) > 0) {
            Pago pagoFinal = Pago.builder()
                    .estadia(estadia)
                    .monto(dto.getPagoFinal())
                    .metodoPago(dto.getMetodoPagoFinal() != null ? dto.getMetodoPagoFinal() : MetodoPago.EFECTIVO)
                    .fechaPago(LocalDateTime.now())
                    .nroOperacion(dto.getNroOperacionFinal())
                    .tipoComprobante(dto.getTipoComprobante() != null ? dto.getTipoComprobante() : "BOLETA")
                    .nroComprobante(dto.getNroComprobante())
                    .notas("Liquidación de Check-Out")
                    .build();
            pagoRepository.save(pagoFinal);
            estadia.getPagos().add(pagoFinal);
        }

        estadia.setFechaSalidaReal(LocalDateTime.now());
        estadia.setEstado(EstadoEstadia.FINALIZADA);
        if (dto != null && dto.getObservaciones() != null) {
            estadia.setObservaciones((estadia.getObservaciones() != null ? estadia.getObservaciones() + " | " : "") + dto.getObservaciones());
        }
        estadiaRepository.save(estadia);

        // Si proviene de reservación, marcar reservación como COMPLETADA
        if (estadia.getReservacion() != null) {
            Reservacion r = estadia.getReservacion();
            r.setEstado(EstadoReservacion.COMPLETADA);
            reservacionRepository.save(r);
        }

        // Cambiar estado de la habitación a LIMPIEZA
        Habitacion hab = estadia.getHabitacion();
        hab.setEstado(EstadoHabitacion.LIMPIEZA);
        habitacionRepository.save(hab);

        // Crear automáticamente la tarea de limpieza para camareras
        TareaLimpieza tarea = TareaLimpieza.builder()
                .habitacion(hab)
                .tipoLimpieza("CHECKOUT")
                .estado(EstadoLimpieza.PENDIENTE)
                .prioridad(PrioridadLimpieza.ALTA)
                .observaciones("Limpieza generada automáticamente tras Check-Out del huésped " + estadia.getHuesped().getNombreCompleto())
                .fechaCreacion(LocalDateTime.now())
                .build();
        tareaLimpiezaRepository.save(tarea);

        BigDecimal saldoFinal = estadia.getSaldoPendiente();

        return CheckOutResponseDTO.builder()
                .estadiaId(estadia.getId())
                .habitacionNumero(hab.getNumero())
                .huespedNombre(estadia.getHuesped().getNombreCompleto())
                .fechaIngreso(estadia.getFechaIngreso())
                .fechaSalidaReal(estadia.getFechaSalidaReal())
                .totalHospedaje(estadia.getTotalHospedaje())
                .totalConsumos(estadia.getTotalConsumos())
                .totalPagar(estadia.getTotalPagar())
                .totalPagado(estadia.getTotalPagado())
                .saldoFinal(saldoFinal)
                .estadoHabitacionActual(EstadoHabitacion.LIMPIEZA.name())
                .mensaje("Check-out realizado exitosamente. Habitación " + hab.getNumero() + " asignada a Limpieza.")
                .build();
    }

    @Override
    @Transactional
    public EstadiaDTO agregarConsumo(Long estadiaId, ConsumoDTO dto) {
        Estadia estadia = estadiaRepository.findById(estadiaId)
                .orElseThrow(() -> new ResourceNotFoundException("Estadía", "id", estadiaId));

        if (estadia.getEstado() != EstadoEstadia.ACTIVA) {
            throw new BadRequestException("No se pueden agregar consumos a una estadía que no está activa");
        }

        BigDecimal subtotal = dto.getPrecioUnitario().multiply(BigDecimal.valueOf(dto.getCantidad()));

        ConsumoServicio consumo = ConsumoServicio.builder()
                .estadia(estadia)
                .nombreServicio(dto.getNombreServicio())
                .cantidad(dto.getCantidad())
                .precioUnitario(dto.getPrecioUnitario())
                .subtotal(subtotal)
                .fechaConsumo(LocalDateTime.now())
                .build();

        consumoServicioRepository.save(consumo);

        BigDecimal totalConsumosActual = estadia.getTotalConsumos() != null ? estadia.getTotalConsumos() : BigDecimal.ZERO;
        estadia.setTotalConsumos(totalConsumosActual.add(subtotal));
        estadia.recalcularTotal();
        estadiaRepository.save(estadia);

        return EntityMapper.toEstadiaDTO(estadiaRepository.findById(estadiaId).orElse(estadia));
    }

    @Override
    @Transactional
    public EstadiaDTO registrarPago(Long estadiaId, PagoDTO dto) {
        Estadia estadia = estadiaRepository.findById(estadiaId)
                .orElseThrow(() -> new ResourceNotFoundException("Estadía", "id", estadiaId));

        Pago pago = Pago.builder()
                .estadia(estadia)
                .monto(dto.getMonto())
                .metodoPago(dto.getMetodoPago())
                .fechaPago(LocalDateTime.now())
                .nroOperacion(dto.getNroOperacion())
                .tipoComprobante(dto.getTipoComprobante() != null ? dto.getTipoComprobante() : "BOLETA")
                .nroComprobante(dto.getNroComprobante())
                .notas(dto.getNotas())
                .build();

        pagoRepository.save(pago);

        return EntityMapper.toEstadiaDTO(estadiaRepository.findById(estadiaId).orElse(estadia));
    }
}
