package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.AsistenteRespuestaDTO;
import com.Sistema.hoteleria.dto.DashboardStatsDTO;
import com.Sistema.hoteleria.dto.OpcionHabitacionDTO;
import com.Sistema.hoteleria.dto.RecomendacionRequestDTO;
import com.Sistema.hoteleria.dto.TareaLimpiezaDTO;
import com.Sistema.hoteleria.service.ia.AsistenteIAService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** Asistente de IA: sugiere, nunca ejecuta operaciones. */
@RestController
@RequestMapping("/api/asistente")
@RequiredArgsConstructor
public class AsistenteController {

    private final AsistenteIAService asistente;

    @GetMapping("/estado")
    public ResponseEntity<ApiResponse<Map<String, Object>>> estado() {
        boolean ia = asistente.iaHabilitada();
        return ResponseEntity.ok(ApiResponse.ok(
                ia ? "Asistente con IA activo" : "Asistente en modo reglas (sin clave de IA)",
                Map.of("iaHabilitada", ia)));
    }

    @PostMapping("/recomendar")
    public ResponseEntity<ApiResponse<AsistenteRespuestaDTO<List<OpcionHabitacionDTO>>>> recomendar(
            @Valid @RequestBody RecomendacionRequestDTO req) {
        return ResponseEntity.ok(ApiResponse.ok("Recomendación generada", asistente.recomendarHabitaciones(req)));
    }

    @GetMapping("/resumen-diario")
    public ResponseEntity<ApiResponse<AsistenteRespuestaDTO<DashboardStatsDTO>>> resumenDiario() {
        return ResponseEntity.ok(ApiResponse.ok("Resumen del día", asistente.resumenDiario()));
    }

    @GetMapping("/limpieza-priorizada")
    public ResponseEntity<ApiResponse<AsistenteRespuestaDTO<List<TareaLimpiezaDTO>>>> limpiezaPriorizada() {
        return ResponseEntity.ok(ApiResponse.ok("Orden sugerido de limpieza", asistente.limpiezaPriorizada()));
    }
}
