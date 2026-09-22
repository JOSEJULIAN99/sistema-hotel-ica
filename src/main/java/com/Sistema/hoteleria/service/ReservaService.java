package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.entity.EstadoReserva;
import com.Sistema.hoteleria.entity.Habitacion;
import com.Sistema.hoteleria.entity.Reserva;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;

    public ReservaService(ReservaRepository reservaRepository, HabitacionRepository habitacionRepository) {
        this.reservaRepository = reservaRepository;
        this.habitacionRepository = habitacionRepository;
    }

    public List<Reserva> listar() { return reservaRepository.findAll(); }

    public Reserva buscar(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
    }

    public Reserva crear(Reserva reserva, Long habitacionId) {
        validarFechas(reserva.getFechaEntrada(), reserva.getFechaSalida());
        Habitacion habitacion = habitacionRepository.findById(habitacionId)
                .orElseThrow(() -> new IllegalArgumentException("Habitacion no encontrada"));
        if (!habitacion.isDisponible()) {
            throw new IllegalArgumentException("La habitacion no esta disponible");
        }
        if (reservaRepository.existeReservaActiva(habitacionId, reserva.getFechaEntrada(), reserva.getFechaSalida())) {
            throw new IllegalArgumentException("La habitacion ya esta reservada en esas fechas");
        }
        reserva.setHabitacion(habitacion);
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        return reservaRepository.save(reserva);
    }

    public Reserva cancelar(Long id) {
        Reserva reserva = buscar(id);
        reserva.setEstado(EstadoReserva.CANCELADA);
        return reservaRepository.save(reserva);
    }

    private void validarFechas(LocalDate entrada, LocalDate salida) {
        if (entrada == null || salida == null || !entrada.isBefore(salida)) {
            throw new IllegalArgumentException("La fecha de entrada debe ser anterior a la fecha de salida");
        }
    }
}