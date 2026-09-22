package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.Estadia;
import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EstadiaRepository extends JpaRepository<Estadia, Long> {

    List<Estadia> findByEstado(EstadoEstadia estado);

    Optional<Estadia> findByHabitacionIdAndEstado(Long habitacionId, EstadoEstadia estado);

    List<Estadia> findByHuespedId(Long huespedId);

    @Query("SELECT e FROM Estadia e WHERE e.estado = com.Sistema.hoteleria.model.enums.EstadoEstadia.ACTIVA ORDER BY e.fechaIngreso DESC")
    List<Estadia> findEstadiasActivas();

    @Query("SELECT e FROM Estadia e WHERE e.fechaSalidaEsperada = :fecha AND e.estado = com.Sistema.hoteleria.model.enums.EstadoEstadia.ACTIVA")
    List<Estadia> findCheckOutsProgramadosHoy(@Param("fecha") LocalDate fecha);

    long countByEstado(EstadoEstadia estado);
}
