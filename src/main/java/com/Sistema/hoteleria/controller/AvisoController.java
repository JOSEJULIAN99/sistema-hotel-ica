package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.AvisoRequestDTO;
import com.Sistema.hoteleria.dto.IncidenciaRequestDTO;
import com.Sistema.hoteleria.model.entity.Aviso;
import com.Sistema.hoteleria.model.entity.Incidencia;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.service.avisos.AvisoService;
import com.Sistema.hoteleria.service.avisos.CanalAvisos;
import com.Sistema.hoteleria.service.avisos.IncidenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/** Avisos instantáneos entre áreas e incidencias de mantenimiento. */
@RestController
@RequiredArgsConstructor
public class AvisoController {

    private final AvisoService avisoService;
    private final CanalAvisos canal;
    private final IncidenciaService incidenciaService;

    private static String usuario(Authentication auth) {
        return auth != null ? auth.getName() : "desconocido";
    }

    /** Rol del usuario autenticado (a partir de la autoridad ROLE_X que pone el filtro JWT). */
    private static RolUsuario rol(Authentication auth) {
        if (auth == null) {
            return null;
        }
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .map(r -> {
                    try {
                        return RolUsuario.valueOf(r);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(r -> r != null)
                .findFirst()
                .orElse(null);
    }

    // ---------- Avisos ----------

    /** Conexión en tiempo real. EventSource no envía encabezados, por eso el token va en ?token=. */
    @GetMapping(value = "/api/avisos/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(Authentication auth) {
        return canal.suscribir(usuario(auth), rol(auth));
    }

    @GetMapping("/api/avisos")
    public ResponseEntity<ApiResponse<List<Aviso>>> recientes(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(avisoService.recientes(rol(auth))));
    }

    @PostMapping("/api/avisos")
    public ResponseEntity<ApiResponse<Aviso>> enviar(@Valid @RequestBody AvisoRequestDTO dto, Authentication auth) {
        Aviso a = avisoService.enviar(dto.getTipo(), dto.getMensaje().trim(), dto.getHabitacionNumero(),
                dto.getRolDestino(), usuario(auth));
        return new ResponseEntity<>(ApiResponse.ok("Aviso enviado", a), HttpStatus.CREATED);
    }

    // ---------- Incidencias ----------

    @GetMapping("/api/incidencias")
    public ResponseEntity<ApiResponse<List<Incidencia>>> incidencias(@RequestParam(required = false) Long habitacionId) {
        return ResponseEntity.ok(ApiResponse.ok(incidenciaService.listar(habitacionId)));
    }

    @PostMapping("/api/incidencias")
    public ResponseEntity<ApiResponse<Incidencia>> reportar(@Valid @RequestBody IncidenciaRequestDTO dto, Authentication auth) {
        return new ResponseEntity<>(ApiResponse.ok("Incidencia registrada",
                incidenciaService.reportar(dto, usuario(auth))), HttpStatus.CREATED);
    }

    @PatchMapping("/api/incidencias/{id}/atender")
    public ResponseEntity<ApiResponse<Incidencia>> atender(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Incidencia en atención", incidenciaService.atender(id, usuario(auth))));
    }

    @PatchMapping("/api/incidencias/{id}/resolver")
    public ResponseEntity<ApiResponse<Incidencia>> resolver(@PathVariable Long id,
                                                           @RequestBody(required = false) Map<String, String> cuerpo,
                                                           Authentication auth) {
        String solucion = cuerpo != null ? cuerpo.get("solucion") : null;
        if (solucion != null && solucion.length() > 500) {
            solucion = solucion.substring(0, 500);
        }
        return ResponseEntity.ok(ApiResponse.ok("Incidencia resuelta", incidenciaService.resolver(id, solucion, usuario(auth))));
    }
}
