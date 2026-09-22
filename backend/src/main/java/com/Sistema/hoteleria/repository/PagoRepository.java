package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByEstadiaId(Long estadiaId);

    @Query("SELECT p FROM Pago p WHERE p.fechaPago >= :desde AND p.fechaPago <= :hasta ORDER BY p.fechaPago DESC")
    List<Pago> findPagosEnRango(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p WHERE p.fechaPago >= :desde AND p.fechaPago <= :hasta")
    BigDecimal sumTotalIngresosEnRango(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}
