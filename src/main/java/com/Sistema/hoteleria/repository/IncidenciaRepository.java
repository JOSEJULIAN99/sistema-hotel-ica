package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.Incidencia;
import com.Sistema.hoteleria.model.enums.EstadoIncidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {

    List<Incidencia> findAllByOrderByFechaReporteDesc();

    List<Incidencia> findByHabitacionIdOrderByFechaReporteDesc(Long habitacionId);

    long countByEstadoIn(Collection<EstadoIncidencia> estados);

    long countByHabitacionIdAndBloqueaHabitacionTrueAndEstadoIn(Long habitacionId, Collection<EstadoIncidencia> estados);
}
