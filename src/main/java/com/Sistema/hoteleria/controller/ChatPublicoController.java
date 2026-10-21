package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.ChatRequestDTO;
import com.Sistema.hoteleria.security.LimitadorSolicitudes;
import com.Sistema.hoteleria.service.ConfiguracionService;
import com.Sistema.hoteleria.service.ia.ChatHuespedService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Endpoints públicos de la web: datos del hotel y chatbot 24/7. */
@RestController
@RequestMapping("/api/publico")
@RequiredArgsConstructor
public class ChatPublicoController {

    private static final int MENSAJES_POR_MINUTO = 20;

    private final ChatHuespedService chatService;
    private final ConfiguracionService configuracionService;
    private final LimitadorSolicitudes limitador;

    @GetMapping("/hotel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> hotel() {
        return ResponseEntity.ok(ApiResponse.ok(configuracionService.datosPublicos()));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chat(@Valid @RequestBody ChatRequestDTO req,
                                                                HttpServletRequest http) {
        limitador.verificar("chat:" + ipCliente(http), MENSAJES_POR_MINUTO);
        return ResponseEntity.ok(ApiResponse.ok(chatService.responder(req)));
    }

    private static String ipCliente(HttpServletRequest http) {
        String reenviada = http.getHeader("X-Forwarded-For");
        if (reenviada != null && !reenviada.isBlank()) {
            return reenviada.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}
