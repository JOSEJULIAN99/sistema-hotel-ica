package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.TareaLimpieza;
import com.Sistema.hoteleria.model.enums.EstadoLimpieza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TareaLimpiezaRepository extends JpaRepository<TareaLimpieza, Long> {

    List<TareaLimpieza> findByEstado(EstadoLimpieza estado);

    List<TareaLimpieza> findByEmpleadoAsignadoId(Long empleadoId);

    List<TareaLimpieza> findByHabitacionId(Long habitacionId);

    @Query("SELECT t FROM TareaLimpieza t WHERE t.estado IN (com.Sistema.hoteleria.model.enums.EstadoLimpieza.PENDIENTE, com.Sistema.hoteleria.model.enums.EstadoLimpieza.EN_PROCESO) ORDER BY t.prioridad DESC, t.fechaCreacion ASC")
    List<TareaLimpieza> findTareasPendientesYEnProceso();

    long countByEstado(EstadoLimpieza estado);
}
