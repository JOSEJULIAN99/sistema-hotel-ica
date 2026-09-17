package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {

    Optional<Habitacion> findByNumero(String numero);

    boolean existsByNumero(String numero);

    List<Habitacion> findByEstado(EstadoHabitacion estado);

    List<Habitacion> findByPiso(Integer piso);

    List<Habitacion> findByTipo(TipoHabitacion tipo);

    List<Habitacion> findByEstadoAndTipo(EstadoHabitacion estado, TipoHabitacion tipo);

    long countByEstado(EstadoHabitacion estado);

    @Query("SELECT h FROM Habitacion h WHERE h.id NOT IN (" +
            "SELECT r.habitacion.id FROM Reservacion r " +
            "WHERE r.estado IN (com.Sistema.hoteleria.model.enums.EstadoReservacion.CONFIRMADA, com.Sistema.hoteleria.model.enums.EstadoReservacion.EN_CURSO) " +
            "AND (r.fechaEntrada < :fechaSalida AND r.fechaSalida > :fechaEntrada)" +
            ") AND h.estado != com.Sistema.hoteleria.model.enums.EstadoHabitacion.MANTENIMIENTO")
    List<Habitacion> findHabitacionesDisponiblesPorFechas(@Param("fechaEntrada") LocalDate fechaEntrada,
                                                         @Param("fechaSalida") LocalDate fechaSalida);
}
