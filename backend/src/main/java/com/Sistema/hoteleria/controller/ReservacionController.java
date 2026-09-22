package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.ReservacionDTO;
import com.Sistema.hoteleria.dto.ReservacionRequestDTO;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.service.ReservacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservacionController {

    private final ReservacionService reservacionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservacionDTO>>> listar(
            @RequestParam(required = false) EstadoReservacion estado,
            @RequestParam(required = false) Long huespedId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        List<ReservacionDTO> resultado;
        if (desde != null && hasta != null) {
            resultado = reservacionService.obtenerPorRangoFechas(desde, hasta);
        } else if (estado != null) {
            resultado = reservacionService.filtrarPorEstado(estado);
        } else if (huespedId != null) {
            resultado = reservacionService.obtenerPorHuesped(huespedId);
        } else {
            resultado = reservacionService.obtenerTodas();
        }

        return ResponseEntity.ok(ApiResponse.ok("Listado de reservaciones", resultado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservacionDTO>> obtenerPorId(@PathVariable Long id) {
        ReservacionDTO res = reservacionService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ApiResponse<ReservacionDTO>> obtenerPorCodigo(@PathVariable String codigo) {
        ReservacionDTO res = reservacionService.obtenerPorCodigo(codigo);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReservacionDTO>> crear(@Valid @RequestBody ReservacionRequestDTO dto) {
        ReservacionDTO nueva = reservacionService.crear(dto);
        return new ResponseEntity<>(ApiResponse.ok("Reservación creada exitosamente", nueva), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<ApiResponse<ReservacionDTO>> confirmar(@PathVariable Long id) {
        ReservacionDTO confirmada = reservacionService.confirmar(id);
        return ResponseEntity.ok(ApiResponse.ok("Reservación confirmada exitosamente", confirmada));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ApiResponse<ReservacionDTO>> cancelar(
            @PathVariable Long id,
            @RequestParam(required = false) String motivo) {
        ReservacionDTO cancelada = reservacionService.cancelar(id, motivo);
        return ResponseEntity.ok(ApiResponse.ok("Reservación cancelada", cancelada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        reservacionService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Reservación eliminada", null));
    }
}
