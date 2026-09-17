package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.PagoDTO;
import com.Sistema.hoteleria.service.PagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PagoController {

    private final PagoService pagoService;

    @GetMapping("/estadia/{estadiaId}")
    public ResponseEntity<ApiResponse<List<PagoDTO>>> listarPorEstadia(@PathVariable Long estadiaId) {
        List<PagoDTO> pagos = pagoService.obtenerPorEstadia(estadiaId);
        return ResponseEntity.ok(ApiResponse.ok("Pagos de la estadía", pagos));
    }

    @GetMapping("/rango")
    public ResponseEntity<ApiResponse<List<PagoDTO>>> listarPorRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        List<PagoDTO> pagos = pagoService.obtenerPorRango(desde, hasta);
        return ResponseEntity.ok(ApiResponse.ok("Pagos registrados en el rango", pagos));
    }

    @GetMapping("/ingresos-total")
    public ResponseEntity<ApiResponse<BigDecimal>> calcularTotalIngresos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        BigDecimal total = pagoService.calcularTotalIngresosEnRango(desde, hasta);
        return ResponseEntity.ok(ApiResponse.ok("Total de ingresos", total));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PagoDTO>> registrar(@Valid @RequestBody PagoDTO dto) {
        PagoDTO creado = pagoService.registrarPago(dto);
        return new ResponseEntity<>(ApiResponse.ok("Pago registrado", creado), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        pagoService.eliminarPago(id);
        return ResponseEntity.ok(ApiResponse.ok("Pago eliminado", null));
    }
}
