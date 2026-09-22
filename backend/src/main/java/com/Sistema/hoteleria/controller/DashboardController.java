package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.DashboardStatsDTO;
import com.Sistema.hoteleria.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> obtenerEstadisticas() {
        DashboardStatsDTO stats = dashboardService.obtenerEstadisticas();
        return ResponseEntity.ok(ApiResponse.ok("Métricas del dashboard actualizadas", stats));
    }

    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> obtenerResumen() {
        DashboardStatsDTO stats = dashboardService.obtenerEstadisticas();
        return ResponseEntity.ok(ApiResponse.ok("Resumen general del hotel", stats));
    }
}
