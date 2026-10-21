package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.PagoOnline;
import com.Sistema.hoteleria.model.enums.EstadoPagoOnline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoOnlineRepository extends JpaRepository<PagoOnline, Long> {

    List<PagoOnline> findTop50ByOrderByFechaCreacionDesc();

    long countByEstado(EstadoPagoOnline estado);
}
