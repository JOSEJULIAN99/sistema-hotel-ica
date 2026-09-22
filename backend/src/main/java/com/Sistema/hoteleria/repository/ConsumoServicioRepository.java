package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.ConsumoServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsumoServicioRepository extends JpaRepository<ConsumoServicio, Long> {

    List<ConsumoServicio> findByEstadiaId(Long estadiaId);
}
