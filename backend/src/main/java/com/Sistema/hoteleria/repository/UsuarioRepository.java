package com.Sistema.hoteleria.repository;

import com.Sistema.hoteleria.model.entity.Usuario;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    boolean existsByUsername(String username);

    List<Usuario> findByRol(RolUsuario rol);

    List<Usuario> findByActivoTrue();
}
