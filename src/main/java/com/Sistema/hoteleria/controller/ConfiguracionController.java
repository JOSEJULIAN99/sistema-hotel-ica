package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.ConfiguracionNegocioDTO;
import com.Sistema.hoteleria.service.ConfiguracionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Base de conocimiento del negocio que usa la IA (panel del administrador). */
@RestController
@RequestMapping("/api/configuracion")
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    @GetMapping
    public ResponseEntity<ApiResponse<ConfiguracionNegocioDTO>> obtener() {
        return ResponseEntity.ok(ApiResponse.ok(configuracionService.obtener()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ConfiguracionNegocioDTO>> actualizar(@Valid @RequestBody ConfiguracionNegocioDTO dto,
                                                                         Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Información del negocio actualizada",
                configuracionService.actualizar(dto, auth != null ? auth.getName() : "desconocido")));
    }
}
