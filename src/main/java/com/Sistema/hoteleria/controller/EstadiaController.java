package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.*;
import com.Sistema.hoteleria.service.EstadiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estadias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EstadiaController {

    private final EstadiaService estadiaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EstadiaDTO>>> listar(
            @RequestParam(required = false, defaultValue = "false") boolean soloActivas) {
        List<EstadiaDTO> list = soloActivas ? estadiaService.obtenerActivas() : estadiaService.obtenerTodas();
        return ResponseEntity.ok(ApiResponse.ok("Listado de estadías", list));
    }

    @GetMapping("/activas")
    public ResponseEntity<ApiResponse<List<EstadiaDTO>>> listarActivas() {
        List<EstadiaDTO> list = estadiaService.obtenerActivas();
        return ResponseEntity.ok(ApiResponse.ok("Estadías activas en el hotel", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EstadiaDTO>> obtenerPorId(@PathVariable Long id) {
        EstadiaDTO estadia = estadiaService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(estadia));
    }

    @GetMapping("/habitacion/{habitacionId}/activa")
    public ResponseEntity<ApiResponse<EstadiaDTO>> obtenerPorHabitacionActiva(@PathVariable Long habitacionId) {
        EstadiaDTO estadia = estadiaService.obtenerPorHabitacionActiva(habitacionId);
        return ResponseEntity.ok(ApiResponse.ok(estadia));
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<EstadiaDTO>> checkIn(@Valid @RequestBody CheckInRequestDTO dto) {
        EstadiaDTO estadia = estadiaService.realizarCheckIn(dto);
        return new ResponseEntity<>(ApiResponse.ok("Check-In realizado exitosamente", estadia), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/check-out")
    public ResponseEntity<ApiResponse<CheckOutResponseDTO>> checkOut(
            @PathVariable Long id,
            @RequestBody(required = false) CheckOutRequestDTO dto) {
        CheckOutResponseDTO response = estadiaService.realizarCheckOut(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Check-Out completado", response));
    }

    @PostMapping("/{id}/consumos")
    public ResponseEntity<ApiResponse<EstadiaDTO>> agregarConsumo(
            @PathVariable Long id,
            @Valid @RequestBody ConsumoDTO dto) {
        dto.setEstadiaId(id);
        EstadiaDTO actualizada = estadiaService.agregarConsumo(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Consumo registrado exitosamente", actualizada));
    }

    @PostMapping("/{id}/pagos")
    public ResponseEntity<ApiResponse<EstadiaDTO>> registrarPago(
            @PathVariable Long id,
            @Valid @RequestBody PagoDTO dto) {
        dto.setEstadiaId(id);
        EstadiaDTO actualizada = estadiaService.registrarPago(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Pago registrado exitosamente", actualizada));
    }
}
