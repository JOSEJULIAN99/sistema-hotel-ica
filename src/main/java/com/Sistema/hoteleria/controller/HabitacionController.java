package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.HabitacionDTO;
import com.Sistema.hoteleria.dto.HabitacionRequestDTO;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import com.Sistema.hoteleria.service.HabitacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/habitaciones")
@RequiredArgsConstructor
public class HabitacionController {

    private final HabitacionService habitacionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HabitacionDTO>>> listar(
            @RequestParam(required = false) EstadoHabitacion estado,
            @RequestParam(required = false) TipoHabitacion tipo,
            @RequestParam(required = false) Integer piso,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        List<HabitacionDTO> resultado;
        if (checkIn != null && checkOut != null) {
            resultado = habitacionService.buscarDisponibles(checkIn, checkOut);
        } else if (estado != null) {
            resultado = habitacionService.filtrarPorEstado(estado);
        } else if (tipo != null) {
            resultado = habitacionService.filtrarPorTipo(tipo);
        } else if (piso != null) {
            resultado = habitacionService.filtrarPorPiso(piso);
        } else {
            resultado = habitacionService.obtenerTodas();
        }

        return ResponseEntity.ok(ApiResponse.ok("Listado de habitaciones obtenido", resultado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitacionDTO>> obtenerPorId(@PathVariable Long id) {
        HabitacionDTO hab = habitacionService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(hab));
    }

    @GetMapping("/numero/{numero}")
    public ResponseEntity<ApiResponse<HabitacionDTO>> obtenerPorNumero(@PathVariable String numero) {
        HabitacionDTO hab = habitacionService.obtenerPorNumero(numero);
        return ResponseEntity.ok(ApiResponse.ok(hab));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HabitacionDTO>> crear(@Valid @RequestBody HabitacionRequestDTO dto) {
        HabitacionDTO nueva = habitacionService.crear(dto);
        return new ResponseEntity<>(ApiResponse.ok("Habitación creada exitosamente", nueva), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitacionDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody HabitacionRequestDTO dto) {
        HabitacionDTO actualizada = habitacionService.actualizar(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Habitación actualizada exitosamente", actualizada));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<HabitacionDTO>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoHabitacion estado) {
        HabitacionDTO actualizada = habitacionService.cambiarEstado(id, estado);
        return ResponseEntity.ok(ApiResponse.ok("Estado de habitación actualizado", actualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        habitacionService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Habitación eliminada exitosamente", null));
    }

    /** Sube la foto desde el panel administrativo (multipart, campo "archivo"). */
    @PostMapping(value = "/{id}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<HabitacionDTO>> subirImagen(@PathVariable Long id,
                                                                @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(ApiResponse.ok("Imagen actualizada", habitacionService.subirImagen(id, archivo)));
    }

    @DeleteMapping("/{id}/imagen")
    public ResponseEntity<ApiResponse<HabitacionDTO>> eliminarImagen(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Imagen eliminada", habitacionService.eliminarImagen(id)));
    }
}
