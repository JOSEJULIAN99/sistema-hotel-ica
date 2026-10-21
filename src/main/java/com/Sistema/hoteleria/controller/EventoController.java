package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.EventoDTO;
import com.Sistema.hoteleria.service.tarifas.EventoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Calendario de eventos y feriados para el motor de tarifas. */
@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService eventoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventoDTO>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(eventoService.listar()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventoDTO>> crear(@Valid @RequestBody EventoDTO dto, Authentication auth) {
        return new ResponseEntity<>(ApiResponse.ok("Evento registrado",
                eventoService.crear(dto, auth != null ? auth.getName() : "desconocido")), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventoDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody EventoDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Evento actualizado", eventoService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        eventoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Evento eliminado", null));
    }
}
