package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.ConsumoDTO;
import com.Sistema.hoteleria.service.ConsumoServicioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consumos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConsumoServicioController {

    private final ConsumoServicioService consumoServicioService;

    @GetMapping("/estadia/{estadiaId}")
    public ResponseEntity<ApiResponse<List<ConsumoDTO>>> listarPorEstadia(@PathVariable Long estadiaId) {
        List<ConsumoDTO> consumos = consumoServicioService.obtenerPorEstadia(estadiaId);
        return ResponseEntity.ok(ApiResponse.ok("Consumos de la estadía", consumos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConsumoDTO>> registrar(@Valid @RequestBody ConsumoDTO dto) {
        ConsumoDTO creado = consumoServicioService.registrarConsumo(dto);
        return new ResponseEntity<>(ApiResponse.ok("Consumo registrado", creado), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        consumoServicioService.eliminarConsumo(id);
        return ResponseEntity.ok(ApiResponse.ok("Consumo eliminado", null));
    }
}
