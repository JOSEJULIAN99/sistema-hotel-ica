package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.LoginRequestDTO;
import com.Sistema.hoteleria.dto.LoginResponseDTO;
import com.Sistema.hoteleria.dto.UsuarioDTO;
import com.Sistema.hoteleria.dto.UsuarioRequestDTO;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UsuarioDTO>>> listar(
            @RequestParam(required = false) RolUsuario rol) {
        List<UsuarioDTO> usuarios = (rol != null)
                ? usuarioService.obtenerPorRol(rol)
                : usuarioService.obtenerTodos();
        return ResponseEntity.ok(ApiResponse.ok("Listado de usuarios / personal", usuarios));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioDTO>> obtenerPorId(@PathVariable Long id) {
        UsuarioDTO u = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(u));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UsuarioDTO>> obtenerPorUsername(@PathVariable String username) {
        UsuarioDTO u = usuarioService.obtenerPorUsername(username);
        return ResponseEntity.ok(ApiResponse.ok(u));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@Valid @RequestBody LoginRequestDTO credenciales) {
        LoginResponseDTO respuesta = usuarioService.login(credenciales.getUsername().trim(), credenciales.getPassword());
        return ResponseEntity.ok(ApiResponse.ok("Inicio de sesión exitoso", respuesta));
    }

    /** Alta de personal: solo el administrador (no existe registro público de trabajadores). */
    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioDTO>> crear(@Valid @RequestBody UsuarioRequestDTO dto) {
        UsuarioDTO creado = usuarioService.crear(dto);
        return new ResponseEntity<>(ApiResponse.ok("Usuario registrado exitosamente", creado), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioDTO>> actualizar(
            @PathVariable Long id,
            @RequestBody UsuarioDTO dto,
            Authentication auth) {
        UsuarioDTO actualizado = usuarioService.actualizar(id, dto, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado", actualizado));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<ApiResponse<UsuarioDTO>> cambiarActivo(
            @PathVariable Long id,
            @RequestParam boolean valor,
            Authentication auth) {
        UsuarioDTO u = usuarioService.cambiarActivo(id, valor, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(valor ? "Usuario activado" : "Usuario desactivado", u));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<ApiResponse<Void>> restablecerPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> cuerpo) {
        usuarioService.restablecerPassword(id, cuerpo.get("password"));
        return ResponseEntity.ok(ApiResponse.ok("Contraseña restablecida. Comuníquela al trabajador por un medio seguro.", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> desactivar(@PathVariable Long id, Authentication auth) {
        usuarioService.desactivar(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Usuario desactivado", null));
    }
}
