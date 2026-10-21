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

    List<Reservacion> findByHuespedIdOrderByFechaEntradaDesc(Long huespedId);

    List<Reservacion> findByHabitacionId(Long habitacionId);

    boolean existsByHabitacionId(Long habitacionId);

    boolean existsByHuespedId(Long huespedId);

    List<Reservacion> findByFechaEntrada(LocalDate fechaEntrada);

    @Query("SELECT r FROM Reservacion r WHERE " +
            "r.fechaEntrada >= :desde AND r.fechaEntrada <= :hasta " +
            "ORDER BY r.fechaEntrada ASC")
    List<Reservacion> findReservacionesEnRango(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT COUNT(r) FROM Reservacion r WHERE r.fechaEntrada = :hoy AND r.estado = com.Sistema.hoteleria.model.enums.EstadoReservacion.CONFIRMADA")
    long countCheckInsProgramadosHoy(@Param("hoy") LocalDate hoy);

    /** Reservas vigentes de una habitación que se cruzan con el rango [fechaEntrada, fechaSalida). */
    @Query("SELECT COUNT(r) FROM Reservacion r WHERE r.habitacion.id = :habitacionId " +
            "AND r.estado IN (com.Sistema.hoteleria.model.enums.EstadoReservacion.PENDIENTE, " +
            "com.Sistema.hoteleria.model.enums.EstadoReservacion.CONFIRMADA, " +
            "com.Sistema.hoteleria.model.enums.EstadoReservacion.EN_CURSO) " +
            "AND r.fechaEntrada < :fechaSalida AND r.fechaSalida > :fechaEntrada")
    long contarReservasSolapadas(@Param("habitacionId") Long habitacionId,
                                 @Param("fechaEntrada") LocalDate fechaEntrada,
                                 @Param("fechaSalida") LocalDate fechaSalida);
}
