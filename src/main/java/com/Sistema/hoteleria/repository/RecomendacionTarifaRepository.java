package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.RecomendacionTarifa;
import com.Sistema.hoteleria.model.enums.EstadoRecomendacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface RecomendacionTarifaRepository extends JpaRepository<RecomendacionTarifa, Long> {

    List<RecomendacionTarifa> findAllByOrderByFechaCreacionDesc();

    List<RecomendacionTarifa> findByEstadoOrderByFechaInicioAsc(EstadoRecomendacion estado);

    List<RecomendacionTarifa> findTop10ByEstadoInOrderByFechaDecisionDesc(Collection<EstadoRecomendacion> estados);

    boolean existsByFechaInicioAndFechaFinAndPorcentajeAndEstadoIn(LocalDate fechaInicio, LocalDate fechaFin,
                                                                 Integer porcentaje, Collection<EstadoRecomendacion> estados);

    long countByEstado(EstadoRecomendacion estado);
}
