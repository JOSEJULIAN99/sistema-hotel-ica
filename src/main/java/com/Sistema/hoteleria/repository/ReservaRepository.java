package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.entity.EstadoReserva;
import com.Sistema.hoteleria.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByEstado(EstadoReserva estado);

    @Query("select count(r) > 0 from Reserva r where r.habitacion.id = :habitacionId "
            + "and r.estado = com.Sistema.hoteleria.entity.EstadoReserva.CONFIRMADA "
            + "and r.fechaEntrada < :salida and r.fechaSalida > :entrada")
    boolean existeReservaActiva(@Param("habitacionId") Long habitacionId,
                                @Param("entrada") LocalDate entrada,
                                @Param("salida") LocalDate salida);
}