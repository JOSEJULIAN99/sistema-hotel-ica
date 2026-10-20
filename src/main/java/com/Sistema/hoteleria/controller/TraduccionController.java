package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.TraduccionRequestDTO;
import com.Sistema.hoteleria.service.ia.TraduccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Traducción automática para atender a turistas extranjeros (RF-11). */
@RestController
@RequestMapping("/api/traduccion")
@RequiredArgsConstructor
public class TraduccionController {

    private final TraduccionService traduccionService;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> traducir(@Valid @RequestBody TraduccionRequestDTO req) {
        return ResponseEntity.ok(ApiResponse.ok("Texto traducido", traduccionService.traducir(req)));
    }
}
