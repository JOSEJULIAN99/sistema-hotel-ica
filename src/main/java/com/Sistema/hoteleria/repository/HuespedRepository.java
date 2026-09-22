package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.Huesped;
import com.Sistema.hoteleria.model.enums.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HuespedRepository extends JpaRepository<Huesped, Long> {

    Optional<Huesped> findByNumeroDocumento(String numeroDocumento);

    boolean existsByNumeroDocumento(String numeroDocumento);

    Optional<Huesped> findByTipoDocumentoAndNumeroDocumento(TipoDocumento tipoDocumento, String numeroDocumento);

    @Query("SELECT h FROM Huesped h WHERE " +
            "LOWER(h.nombres) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
            "LOWER(h.apellidos) LIKE LOWER(CONCAT('%', :filtro, '%')) OR " +
            "h.numeroDocumento LIKE CONCAT('%', :filtro, '%')")
    List<Huesped> buscarPorNombreODocumento(@Param("filtro") String filtro);
}
