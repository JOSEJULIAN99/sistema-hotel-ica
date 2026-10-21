package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.RegistroActividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RegistroActividadRepository extends JpaRepository<RegistroActividad, Long> {

    List<RegistroActividad> findTop40ByOrderByFechaDesc();

    List<RegistroActividad> findTop15ByEstadoHttpGreaterThanEqualAndFechaAfterOrderByFechaDesc(Integer estado, LocalDateTime desde);

    long countByFechaAfter(LocalDateTime desde);

    long countByEstadoHttpGreaterThanEqualAndFechaAfter(Integer estado, LocalDateTime desde);

    long countByEstadoHttpBetweenAndFechaAfter(Integer desde, Integer hasta, LocalDateTime fecha);

    @Modifying
    @Query("DELETE FROM RegistroActividad r WHERE r.fecha < :limite")
    int borrarAnterioresA(@Param("limite") LocalDateTime limite);
}
