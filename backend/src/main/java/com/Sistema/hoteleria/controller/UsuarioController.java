package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.UsuarioDTO;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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

    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioDTO>> crear(
            @RequestBody UsuarioDTO dto,
            @RequestParam(required = false, defaultValue = "hotel1234") String password) {
        UsuarioDTO creado = usuarioService.crear(dto, password);
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
