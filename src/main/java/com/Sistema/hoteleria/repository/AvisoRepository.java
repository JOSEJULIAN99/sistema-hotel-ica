package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.Aviso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AvisoRepository extends JpaRepository<Aviso, Long> {

    List<Aviso> findTop50ByOrderByFechaDesc();

    long countByFechaAfter(LocalDateTime desde);
}
