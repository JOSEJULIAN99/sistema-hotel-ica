package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.UsuarioDTO;
import com.Sistema.hoteleria.model.enums.RolUsuario;

import java.util.List;

public interface UsuarioService {
    List<UsuarioDTO> obtenerTodos();
    List<UsuarioDTO> obtenerPorRol(RolUsuario rol);
    UsuarioDTO obtenerPorId(Long id);
    UsuarioDTO obtenerPorUsername(String username);
    UsuarioDTO login(String username, String password);
    UsuarioDTO crear(UsuarioDTO dto, String password);
    UsuarioDTO actualizar(Long id, UsuarioDTO dto);
    void desactivar(Long id);
}
