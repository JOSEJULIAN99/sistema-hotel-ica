package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.LoginResponseDTO;
import com.Sistema.hoteleria.dto.UsuarioDTO;
import com.Sistema.hoteleria.dto.UsuarioRequestDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Usuario;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.repository.UsuarioRepository;
import com.Sistema.hoteleria.security.JwtService;
import com.Sistema.hoteleria.service.UsuarioService;
import com.Sistema.hoteleria.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> obtenerTodos() {
        // Los clientes de la web no forman parte del personal
        return usuarioRepository.findByRolNot(RolUsuario.CLIENTE).stream()
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
    @Transactional
    public LoginResponseDTO login(String username, String password) {
        Usuario u = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("Usuario o contraseña incorrectos"));
        if (password == null || !passwordValida(u, password)) {
            throw new BadRequestException("Usuario o contraseña incorrectos");
        }
        if (u.getRol() == RolUsuario.CLIENTE) {
            throw new BadRequestException("Esta cuenta es de cliente. Ingrese desde la web del hotel, en «Mi cuenta».");
        }
        if (Boolean.FALSE.equals(u.getActivo())) {
            throw new BadRequestException("El usuario se encuentra desactivado en el sistema");
        }
        return LoginResponseDTO.builder()
                .token(jwtService.generarToken(u))
                .tipo("Bearer")
                .expiraEnMinutos(jwtService.getExpirationMinutes())
                .usuario(EntityMapper.toUsuarioDTO(u))
                .build();
    }

    /**
     * Valida la contraseña con BCrypt. Si la cuenta aún tiene una contraseña antigua
     * en texto plano (datos de init.sql), se acepta una única vez y se migra a BCrypt.
     */
    private boolean passwordValida(Usuario u, String password) {
        String guardada = u.getPassword();
        if (guardada == null) {
            return false;
        }
        if (guardada.startsWith("$2")) {
            return passwordEncoder.matches(password, guardada);
        }
        if (guardada.equals(password)) {
            u.setPassword(passwordEncoder.encode(password));
            usuarioRepository.save(u);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public UsuarioDTO crear(UsuarioRequestDTO dto) {
        return EntityMapper.toUsuarioDTO(usuarioRepository.save(nuevoUsuario(dto,
                dto.getRol() != null ? dto.getRol() : RolUsuario.RECEPCIONISTA, true)));
    }

    /** Registro desde la pantalla pública: queda como RECEPCIONISTA inactivo hasta que un administrador lo active. */
    @Override
    @Transactional
    public UsuarioDTO registrarPendiente(UsuarioRequestDTO dto) {
        return EntityMapper.toUsuarioDTO(usuarioRepository.save(nuevoUsuario(dto, RolUsuario.RECEPCIONISTA, false)));
    }

    private Usuario nuevoUsuario(UsuarioRequestDTO dto, RolUsuario rol, boolean activo) {
        String username = dto.getUsername().trim().toLowerCase();
        if (usuarioRepository.existsByUsername(username)) {
            throw new BadRequestException("El nombre de usuario '" + username + "' ya está registrado");
        }
        return Usuario.builder()
                .username(username)
                .password(passwordEncoder.encode(dto.getPassword()))
                .nombreCompleto(dto.getNombreCompleto())
                .email(dto.getEmail())
                .telefono(dto.getTelefono())
                .rol(rol)
                .turno(dto.getTurno() != null ? dto.getTurno() : "Mañana")
                .activo(activo)
                .build();
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
