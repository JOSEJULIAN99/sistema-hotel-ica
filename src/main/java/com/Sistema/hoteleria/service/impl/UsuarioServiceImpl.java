package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.UsuarioDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Usuario;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.repository.UsuarioRepository;
import com.Sistema.hoteleria.service.UsuarioService;
import com.Sistema.hoteleria.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> obtenerTodos() {
        return usuarioRepository.findAll().stream()
                .map(EntityMapper::toUsuarioDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> obtenerPorRol(RolUsuario rol) {
        return usuarioRepository.findByRol(rol).stream()
                .map(EntityMapper::toUsuarioDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO obtenerPorId(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
        return EntityMapper.toUsuarioDTO(u);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO obtenerPorUsername(String username) {
        Usuario u = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "username", username));
        return EntityMapper.toUsuarioDTO(u);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO login(String username, String password) {
        Usuario u = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("Usuario o contraseña incorrectos"));
        if (password == null || !password.equals(u.getPassword())) {
            throw new BadRequestException("Usuario o contraseña incorrectos");
        }
        if (Boolean.FALSE.equals(u.getActivo())) {
            throw new BadRequestException("El usuario se encuentra desactivado en el sistema");
        }
        return EntityMapper.toUsuarioDTO(u);
    }

    @Override
    @Transactional
    public UsuarioDTO crear(UsuarioDTO dto, String password) {
        if (usuarioRepository.existsByUsername(dto.getUsername())) {
            throw new BadRequestException("El nombre de usuario '" + dto.getUsername() + "' ya está registrado");
        }

        Usuario u = Usuario.builder()
                .username(dto.getUsername())
                .password(password != null ? password : "password123")
                .nombreCompleto(dto.getNombreCompleto())
                .email(dto.getEmail())
                .telefono(dto.getTelefono())
                .rol(dto.getRol() != null ? dto.getRol() : RolUsuario.RECEPCIONISTA)
                .turno(dto.getTurno() != null ? dto.getTurno() : "Mañana")
                .activo(true)
                .build();

        return EntityMapper.toUsuarioDTO(usuarioRepository.save(u));
    }

    @Override
    @Transactional
    public UsuarioDTO actualizar(Long id, UsuarioDTO dto) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));

        u.setNombreCompleto(dto.getNombreCompleto());
        u.setEmail(dto.getEmail());
        u.setTelefono(dto.getTelefono());
        if (dto.getRol() != null) u.setRol(dto.getRol());
        if (dto.getTurno() != null) u.setTurno(dto.getTurno());
        if (dto.getActivo() != null) u.setActivo(dto.getActivo());

        return EntityMapper.toUsuarioDTO(usuarioRepository.save(u));
    }

    @Override
    @Transactional
    public void desactivar(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
        u.setActivo(false);
        usuarioRepository.save(u);
    }
}
