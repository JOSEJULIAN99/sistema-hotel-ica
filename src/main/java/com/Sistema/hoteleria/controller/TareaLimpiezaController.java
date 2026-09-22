package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.TareaLimpiezaDTO;
import com.Sistema.hoteleria.dto.TareaLimpiezaRequestDTO;
import com.Sistema.hoteleria.service.TareaLimpiezaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/limpieza")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TareaLimpiezaController {

    private final TareaLimpiezaService tareaLimpiezaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TareaLimpiezaDTO>>> listar(
            @RequestParam(required = false, defaultValue = "false") boolean soloPendientes,
            @RequestParam(required = false) Long empleadoId) {
        List<TareaLimpiezaDTO> resultado;
        if (empleadoId != null) {
            resultado = tareaLimpiezaService.obtenerPorEmpleado(empleadoId);
        } else if (soloPendientes) {
            resultado = tareaLimpiezaService.obtenerPendientes();
        } else {
            resultado = tareaLimpiezaService.obtenerTodas();
        }
        return ResponseEntity.ok(ApiResponse.ok("Tareas de limpieza", resultado));
    }

    @GetMapping("/pendientes")
    public ResponseEntity<ApiResponse<List<TareaLimpiezaDTO>>> listarPendientes() {
        List<TareaLimpiezaDTO> pendientes = tareaLimpiezaService.obtenerPendientes();
        return ResponseEntity.ok(ApiResponse.ok("Tareas pendientes de limpieza", pendientes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TareaLimpiezaDTO>> obtenerPorId(@PathVariable Long id) {
        TareaLimpiezaDTO tarea = tareaLimpiezaService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(tarea));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TareaLimpiezaDTO>> crear(@Valid @RequestBody TareaLimpiezaRequestDTO dto) {
        TareaLimpiezaDTO creada = tareaLimpiezaService.crear(dto);
        return new ResponseEntity<>(ApiResponse.ok("Tarea de limpieza creada", creada), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/asignar")
    public ResponseEntity<ApiResponse<TareaLimpiezaDTO>> asignarEmpleado(
            @PathVariable Long id,
            @RequestParam Long empleadoId) {
        TareaLimpiezaDTO actualizada = tareaLimpiezaService.asignarEmpleado(id, empleadoId);
        return ResponseEntity.ok(ApiResponse.ok("Personal asignado a la tarea", actualizada));
    }

    @PatchMapping("/{id}/iniciar")
    public ResponseEntity<ApiResponse<TareaLimpiezaDTO>> iniciar(@PathVariable Long id) {
        TareaLimpiezaDTO actualizada = tareaLimpiezaService.iniciarLimpieza(id);
        return ResponseEntity.ok(ApiResponse.ok("Limpieza iniciada", actualizada));
    }

    @PatchMapping("/{id}/completar")
    public ResponseEntity<ApiResponse<TareaLimpiezaDTO>> completar(@PathVariable Long id) {
        TareaLimpiezaDTO actualizada = tareaLimpiezaService.completarLimpieza(id);
        return ResponseEntity.ok(ApiResponse.ok("Limpieza completada. Habitación disponible.", actualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        tareaLimpiezaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Tarea de limpieza eliminada", null));
    }
}
