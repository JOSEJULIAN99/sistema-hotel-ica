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
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("/registro")
    public ResponseEntity<ApiResponse<UsuarioDTO>> registro(@Valid @RequestBody UsuarioRequestDTO dto) {
        UsuarioDTO creado = usuarioService.registrarPendiente(dto);
        return new ResponseEntity<>(ApiResponse.ok(
                "Cuenta creada. Un administrador debe activarla antes del primer ingreso.", creado), HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioDTO>> crear(@Valid @RequestBody UsuarioRequestDTO dto) {
        UsuarioDTO creado = usuarioService.crear(dto);
        return new ResponseEntity<>(ApiResponse.ok("Usuario registrado exitosamente", creado), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioDTO>> actualizar(
            @PathVariable Long id,
            @RequestBody UsuarioDTO dto) {
        UsuarioDTO actualizado = usuarioService.actualizar(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado", actualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
        return ResponseEntity.ok(ApiResponse.ok("Usuario desactivado", null));
    }
}
