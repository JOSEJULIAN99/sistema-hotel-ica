package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservacionRepository extends JpaRepository<Reservacion, Long> {

    Optional<Reservacion> findByCodigoReserva(String codigoReserva);

    List<Reservacion> findByEstado(EstadoReservacion estado);

    List<Reservacion> findByHuespedId(Long huespedId);

    List<Reservacion> findByHabitacionId(Long habitacionId);

    List<Reservacion> findByFechaEntrada(LocalDate fechaEntrada);

    @Query("SELECT r FROM Reservacion r WHERE " +
            "r.fechaEntrada >= :desde AND r.fechaEntrada <= :hasta " +
            "ORDER BY r.fechaEntrada ASC")
    List<Reservacion> findReservacionesEnRango(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT COUNT(r) FROM Reservacion r WHERE r.fechaEntrada = :hoy AND r.estado = com.Sistema.hoteleria.model.enums.EstadoReservacion.CONFIRMADA")
    long countCheckInsProgramadosHoy(@Param("hoy") LocalDate hoy);
}
