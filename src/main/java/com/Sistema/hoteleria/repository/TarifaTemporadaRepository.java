package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.TarifaTemporada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TarifaTemporadaRepository extends JpaRepository<TarifaTemporada, Long> {

    List<TarifaTemporada> findAllByOrderByFechaInicioDesc();

    @Query("SELECT t FROM TarifaTemporada t WHERE t.activa = true AND t.fechaInicio <= :hasta AND t.fechaFin >= :desde")
    List<TarifaTemporada> findActivasEnRango(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
