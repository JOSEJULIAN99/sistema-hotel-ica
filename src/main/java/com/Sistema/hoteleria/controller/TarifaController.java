package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.DecisionTarifaDTO;
import com.Sistema.hoteleria.dto.TarifaTemporadaDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.entity.RecomendacionTarifa;
import com.Sistema.hoteleria.model.entity.TarifaTemporada;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.TarifaTemporadaRepository;
import com.Sistema.hoteleria.service.ConfiguracionService;
import com.Sistema.hoteleria.service.tarifas.CalculadoraTarifa;
import com.Sistema.hoteleria.service.tarifas.MotorTarifasService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Motor de tarifas dinámicas: análisis, decisiones del administrador, temporadas y cotización. */
@RestController
@RequiredArgsConstructor
public class TarifaController {

    private final MotorTarifasService motor;
    private final TarifaTemporadaRepository tarifaRepository;
    private final HabitacionRepository habitacionRepository;
    private final ConfiguracionService configuracionService;

    private static String usuario(Authentication auth) {
        return auth != null ? auth.getName() : "desconocido";
    }

    // ---------- Recomendaciones ----------

    @GetMapping("/api/tarifas/recomendaciones")
    public ResponseEntity<ApiResponse<List<RecomendacionTarifa>>> pendientes() {
        return ResponseEntity.ok(ApiResponse.ok("Recomendaciones por decidir", motor.pendientes()));
    }

    @GetMapping("/api/tarifas/historial")
    public ResponseEntity<ApiResponse<List<RecomendacionTarifa>>> historial() {
        return ResponseEntity.ok(ApiResponse.ok("Historial de decisiones de tarifas", motor.historial()));
    }

    /** Analiza un rango (por defecto: mañana + horizonte configurado) y crea recomendaciones nuevas. */
    @PostMapping("/api/tarifas/analizar")
    public ResponseEntity<ApiResponse<List<RecomendacionTarifa>>> analizar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            Authentication auth) {
        LocalDate inicio = desde != null ? desde : LocalDate.now().plusDays(1);
        LocalDate fin = hasta != null ? hasta : inicio.plusDays(configuracionService.reglasTarifa().horizonteDias() - 1L);
        List<RecomendacionTarifa> nuevas = motor.analizar(inicio, fin, usuario(auth));
        String mensaje = nuevas.isEmpty()
                ? "No hay subidas que recomendar entre " + inicio + " y " + fin
                : nuevas.size() + " recomendaciones nuevas entre " + inicio + " y " + fin;
        return ResponseEntity.ok(ApiResponse.ok(mensaje, nuevas));
    }

    @PatchMapping("/api/tarifas/recomendaciones/{id}/decidir")
    public ResponseEntity<ApiResponse<RecomendacionTarifa>> decidir(@PathVariable Long id,
                                                                   @Valid @RequestBody DecisionTarifaDTO dto,
                                                                   Authentication auth) {
        RecomendacionTarifa r = motor.decidir(id, dto.getAprobar(), dto.getPorcentaje(), dto.getComentario(), usuario(auth));
        return ResponseEntity.ok(ApiResponse.ok(dto.getAprobar()
                ? "Tarifa aprobada: se aplica a las reservas nuevas de esas fechas"
                : "Recomendación rechazada y registrada en el historial", r));
    }

    // ---------- Tarifas de temporada ----------

    @GetMapping("/api/tarifas/temporadas")
    public ResponseEntity<ApiResponse<List<TarifaTemporada>>> temporadas() {
        return ResponseEntity.ok(ApiResponse.ok(tarifaRepository.findAllByOrderByFechaInicioDesc()));
    }

    @PostMapping("/api/tarifas/temporadas")
    public ResponseEntity<ApiResponse<TarifaTemporada>> crearTemporada(@Valid @RequestBody TarifaTemporadaDTO dto,
                                                                       Authentication auth) {
        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new BadRequestException("La fecha de fin debe ser igual o posterior a la de inicio");
        }
        int maximo = configuracionService.reglasTarifa().aumentoMaximo();
        if (dto.getPorcentaje() > maximo) {
            throw new BadRequestException("El aumento supera el tope configurado de +" + maximo + " %");
        }
        TarifaTemporada t = tarifaRepository.save(TarifaTemporada.builder()
                .nombre(dto.getNombre().trim())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .porcentaje(dto.getPorcentaje())
                .tipoHabitacion(dto.getTipoHabitacion())
                .activa(true)
                .creadoPor(usuario(auth))
                .build());
        return new ResponseEntity<>(ApiResponse.ok("Tarifa de temporada creada", t), HttpStatus.CREATED);
    }

    @PatchMapping("/api/tarifas/temporadas/{id}/desactivar")
    @Transactional
    public ResponseEntity<ApiResponse<TarifaTemporada>> desactivar(@PathVariable Long id) {
        TarifaTemporada t = tarifaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarifa de temporada", "id", id));
        t.setActiva(false);
        return ResponseEntity.ok(ApiResponse.ok("Tarifa desactivada", tarifaRepository.save(t)));
    }

    // ---------- Cotización pública ----------

    /** Precio de una estancia con las tarifas vigentes (lo usan la web y el formulario de reserva). */
    @GetMapping("/api/publico/cotizacion")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> cotizar(
            @RequestParam Long habitacionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate entrada,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate salida) {
        if (!salida.isAfter(entrada)) {
            throw new BadRequestException("La fecha de salida debe ser posterior a la de entrada");
        }
        if (ChronoUnit.DAYS.between(entrada, salida) > 60) {
            throw new BadRequestException("Cotice como máximo 60 noches");
        }
        Habitacion h = habitacionRepository.findById(habitacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación", "id", habitacionId));
        long noches = ChronoUnit.DAYS.between(entrada, salida);
        BigDecimal base = h.getPrecioPorNoche().multiply(BigDecimal.valueOf(noches));
        BigDecimal total = CalculadoraTarifa.total(h.getPrecioPorNoche(), h.getTipo(), entrada, salida,
                tarifaRepository.findActivasEnRango(entrada, salida));

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("habitacion", h.getNumero());
        r.put("noches", noches);
        r.put("precioPorNoche", h.getPrecioPorNoche());
        r.put("totalBase", base);
        r.put("total", total);
        r.put("ajusteTemporada", total.subtract(base));
        return ResponseEntity.ok(ApiResponse.ok(r));
    }
}
