package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.service.monitoreo.MonitoreoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/monitoreo")
@RequiredArgsConstructor
public class MonitoreoController {

    private final MonitoreoService monitoreoService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> resumen() {
        return ResponseEntity.ok(ApiResponse.ok("Estado del sistema", monitoreoService.resumen()));
    }
}
