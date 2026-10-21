package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.LoginResponseDTO;
import com.Sistema.hoteleria.dto.UsuarioDTO;
import com.Sistema.hoteleria.dto.UsuarioRequestDTO;
import com.Sistema.hoteleria.model.enums.RolUsuario;

import java.util.List;

public interface UsuarioService {
    List<UsuarioDTO> obtenerTodos();
    List<UsuarioDTO> obtenerPorRol(RolUsuario rol);
    UsuarioDTO obtenerPorId(Long id);
    UsuarioDTO obtenerPorUsername(String username);
    LoginResponseDTO login(String username, String password);
    UsuarioDTO crear(UsuarioRequestDTO dto);
    UsuarioDTO actualizar(Long id, UsuarioDTO dto, String solicitante);
    UsuarioDTO cambiarActivo(Long id, boolean activo, String solicitante);
    void restablecerPassword(Long id, String nuevaPassword);
    void desactivar(Long id, String solicitante);
}
