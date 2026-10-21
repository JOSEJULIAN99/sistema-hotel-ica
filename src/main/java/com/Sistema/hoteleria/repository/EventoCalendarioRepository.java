package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.EventoCalendario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventoCalendarioRepository extends JpaRepository<EventoCalendario, Long> {

    List<EventoCalendario> findAllByOrderByFechaInicioAsc();

    @Query("SELECT e FROM EventoCalendario e WHERE e.activo = true AND e.fechaInicio <= :hasta AND e.fechaFin >= :desde")
    List<EventoCalendario> findActivosEnRango(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
