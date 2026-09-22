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
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.HuespedRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.service.ReservacionService;
import com.Sistema.hoteleria.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservacionServiceImpl implements ReservacionService {

    private final ReservacionRepository reservacionRepository;
    private final HuespedRepository huespedRepository;
    private final HabitacionRepository habitacionRepository;

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
        if (dto.getFechaSalida().isBefore(dto.getFechaEntrada()) || dto.getFechaSalida().isEqual(dto.getFechaEntrada())) {
            throw new BadRequestException("La fecha de salida debe ser posterior a la fecha de entrada");
        }

        Huesped huesped = huespedRepository.findById(dto.getHuespedId())
                .orElseThrow(() -> new ResourceNotFoundException("Huésped", "id", dto.getHuespedId()));

        Habitacion habitacion = habitacionRepository.findById(dto.getHabitacionId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitación", "id", dto.getHabitacionId()));

        if (dto.getNumeroPersonas() > habitacion.getCapacidad()) {
            throw new BadRequestException("La capacidad máxima de la habitación (" + habitacion.getCapacidad() + ") es menor al número de personas (" + dto.getNumeroPersonas() + ")");
        }

        String codigoGenerado = "RES-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Reservacion r = Reservacion.builder()
                .codigoReserva(codigoGenerado)
                .huesped(huesped)
                .habitacion(habitacion)
                .fechaEntrada(dto.getFechaEntrada())
                .fechaSalida(dto.getFechaSalida())
                .numeroPersonas(dto.getNumeroPersonas())
                .precioTotal(dto.getPrecioTotal())
                .adelanto(dto.getAdelanto() != null ? dto.getAdelanto() : BigDecimal.ZERO)
                .estado(EstadoReservacion.CONFIRMADA)
                .observaciones(dto.getObservaciones())
                .build();

        if (dto.getFechaEntrada().isEqual(LocalDate.now())) {
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
        r.setEstado(EstadoReservacion.CONFIRMADA);
        return EntityMapper.toReservacionDTO(reservacionRepository.save(r));
    }

    @Override
    @Transactional
    public ReservacionDTO cancelar(Long id, String motivo) {
        Reservacion r = reservacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservación", "id", id));
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
        if (!reservacionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Reservación", "id", id);
        }
        reservacionRepository.deleteById(id);
    }
}
