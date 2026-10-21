package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.ReservacionDTO;
import com.Sistema.hoteleria.dto.ReservacionRequestDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.entity.Huesped;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.HuespedRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.repository.TarifaTemporadaRepository;
import com.Sistema.hoteleria.service.tarifas.CalculadoraTarifa;
import com.Sistema.hoteleria.service.ReservacionService;
import com.Sistema.hoteleria.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservacionServiceImpl implements ReservacionService {

    private final ReservacionRepository reservacionRepository;
    private final HuespedRepository huespedRepository;
    private final HabitacionRepository habitacionRepository;
    private final EstadiaRepository estadiaRepository;
    private final TarifaTemporadaRepository tarifaTemporadaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReservacionDTO> obtenerTodas() {
        return reservacionRepository.findAll().stream()
                .map(EntityMapper::toReservacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservacionDTO obtenerPorId(Long id) {
        Reservacion r = reservacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservación", "id", id));
        return EntityMapper.toReservacionDTO(r);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservacionDTO obtenerPorCodigo(String codigo) {
        Reservacion r = reservacionRepository.findByCodigoReserva(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Reservación", "código", codigo));
        return EntityMapper.toReservacionDTO(r);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservacionDTO> filtrarPorEstado(EstadoReservacion estado) {
        return reservacionRepository.findByEstado(estado).stream()
                .map(EntityMapper::toReservacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservacionDTO> obtenerPorHuesped(Long huespedId) {
        return reservacionRepository.findByHuespedId(huespedId).stream()
                .map(EntityMapper::toReservacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservacionDTO> obtenerPorRangoFechas(LocalDate desde, LocalDate hasta) {
        return reservacionRepository.findReservacionesEnRango(desde, hasta).stream()
                .map(EntityMapper::toReservacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReservacionDTO crear(ReservacionRequestDTO dto) {
        return crearConEstado(dto, EstadoReservacion.CONFIRMADA);
    }

    /** Reservas de la web pública: quedan PENDIENTES hasta que recepción las confirme. */
    @Override
    @Transactional
    public ReservacionDTO crearPendiente(ReservacionRequestDTO dto) {
        return crearConEstado(dto, EstadoReservacion.PENDIENTE);
    }

    private ReservacionDTO crearConEstado(ReservacionRequestDTO dto, EstadoReservacion estadoInicial) {
        if (!dto.getFechaSalida().isAfter(dto.getFechaEntrada())) {
            throw new BadRequestException("La fecha de salida debe ser posterior a la fecha de entrada");
        }

        Huesped huesped = huespedRepository.findById(dto.getHuespedId())
                .orElseThrow(() -> new ResourceNotFoundException("Huésped", "id", dto.getHuespedId()));

        Habitacion habitacion = habitacionRepository.findById(dto.getHabitacionId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitación", "id", dto.getHabitacionId()));

        if (habitacion.getEstado() == EstadoHabitacion.MANTENIMIENTO) {
            throw new BadRequestException("La habitación " + habitacion.getNumero() + " está en mantenimiento y no admite reservas");
        }

        if (dto.getNumeroPersonas() > habitacion.getCapacidad()) {
            throw new BadRequestException("La capacidad máxima de la habitación (" + habitacion.getCapacidad() + ") es menor al número de personas (" + dto.getNumeroPersonas() + ")");
        }

        // Una estadía activa (incluye walk-in sin reserva) bloquea la habitación hasta su salida esperada
        estadiaRepository.findByHabitacionIdAndEstado(habitacion.getId(), EstadoEstadia.ACTIVA)
                .filter(e -> e.getFechaSalidaEsperada().isAfter(dto.getFechaEntrada()))
                .ifPresent(e -> {
                    throw new BadRequestException("La habitación " + habitacion.getNumero()
                            + " está ocupada hasta el " + e.getFechaSalidaEsperada());
                });

        long solapadas = reservacionRepository.contarReservasSolapadas(
                habitacion.getId(), dto.getFechaEntrada(), dto.getFechaSalida());
        if (solapadas > 0) {
            throw new BadRequestException("La habitación " + habitacion.getNumero()
                    + " ya tiene una reserva que se cruza con las fechas " + dto.getFechaEntrada() + " a " + dto.getFechaSalida());
        }

        // Precio noche por noche con las tarifas de temporada aprobadas por el administrador
        BigDecimal precioTotal = CalculadoraTarifa.total(habitacion.getPrecioPorNoche(), habitacion.getTipo(),
                dto.getFechaEntrada(), dto.getFechaSalida(),
                tarifaTemporadaRepository.findActivasEnRango(dto.getFechaEntrada(), dto.getFechaSalida()));

        BigDecimal adelanto = dto.getAdelanto() != null ? dto.getAdelanto() : BigDecimal.ZERO;
        if (adelanto.compareTo(precioTotal) > 0) {
            throw new BadRequestException("El adelanto (S/ " + adelanto + ") no puede superar el total de la reserva (S/ " + precioTotal + ")");
        }

        String codigoGenerado = "RES-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Reservacion r = Reservacion.builder()
                .codigoReserva(codigoGenerado)
                .huesped(huesped)
                .habitacion(habitacion)
                .fechaEntrada(dto.getFechaEntrada())
                .fechaSalida(dto.getFechaSalida())
                .numeroPersonas(dto.getNumeroPersonas())
                .precioTotal(precioTotal)
                .adelanto(adelanto)
                .estado(estadoInicial)
                .observaciones(dto.getObservaciones())
                .build();

        // Solo se marca RESERVADA si la habitación está libre; nunca se pisa OCUPADA ni LIMPIEZA
        if (dto.getFechaEntrada().isEqual(LocalDate.now()) && habitacion.getEstado() == EstadoHabitacion.DISPONIBLE) {
            habitacion.setEstado(EstadoHabitacion.RESERVADA);
            habitacionRepository.save(habitacion);
        }

        return EntityMapper.toReservacionDTO(reservacionRepository.save(r));
    }

    @Override
    @Transactional
    public ReservacionDTO confirmar(Long id) {
        Reservacion r = reservacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservación", "id", id));
        if (r.getEstado() == EstadoReservacion.CONFIRMADA) {
            return EntityMapper.toReservacionDTO(r);
        }
        if (r.getEstado() != EstadoReservacion.PENDIENTE) {
            throw new BadRequestException("Solo se puede confirmar una reserva PENDIENTE. Estado actual: " + r.getEstado());
        }
        r.setEstado(EstadoReservacion.CONFIRMADA);
        return EntityMapper.toReservacionDTO(reservacionRepository.save(r));
    }

    @Override
    @Transactional
    public ReservacionDTO cancelar(Long id, String motivo) {
        Reservacion r = reservacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservación", "id", id));
        if (r.getEstado() == EstadoReservacion.EN_CURSO) {
            throw new BadRequestException("La reserva ya tiene check-in; debe cerrarse con check-out");
        }
        if (r.getEstado() == EstadoReservacion.COMPLETADA || r.getEstado() == EstadoReservacion.CANCELADA) {
            throw new BadRequestException("La reserva ya está " + r.getEstado());
        }
        r.setEstado(EstadoReservacion.CANCELADA);
        if (motivo != null && !motivo.isEmpty()) {
            r.setObservaciones((r.getObservaciones() != null ? r.getObservaciones() + " | " : "") + "Cancelado: " + motivo);
        }
        if (r.getHabitacion().getEstado() == EstadoHabitacion.RESERVADA) {
            r.getHabitacion().setEstado(EstadoHabitacion.DISPONIBLE);
            habitacionRepository.save(r.getHabitacion());
        }
        return EntityMapper.toReservacionDTO(reservacionRepository.save(r));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Reservacion r = reservacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservación", "id", id));
        if (r.getEstado() != EstadoReservacion.CANCELADA && r.getEstado() != EstadoReservacion.PENDIENTE) {
            throw new BadRequestException("Solo se pueden eliminar reservas PENDIENTES o CANCELADAS; las demás quedan como historial");
        }
        reservacionRepository.delete(r);
    }
}
