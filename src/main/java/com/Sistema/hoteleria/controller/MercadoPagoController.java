package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.model.entity.PagoOnline;
import com.Sistema.hoteleria.service.pagos.MercadoPagoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Cobros en línea con Mercado Pago (modo prueba con credenciales TEST-). */
@Slf4j
@RestController
@RequiredArgsConstructor
public class MercadoPagoController {

    private final MercadoPagoService mercadoPago;

    // ---------- Personal ----------

    @GetMapping("/api/pagos/mercadopago/estado")
    public ResponseEntity<ApiResponse<Map<String, Object>>> estado() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "configurado", mercadoPago.configurado(),
                "modoPrueba", mercadoPago.modoPrueba())));
    }

    /** Genera el link de pago del saldo de una estadía (o del monto indicado). */
    @PostMapping("/api/pagos/mercadopago/estadias/{estadiaId}")
    public ResponseEntity<ApiResponse<PagoOnline>> linkEstadia(@PathVariable Long estadiaId,
                                                              @RequestBody(required = false) Map<String, Object> cuerpo,
                                                              Authentication auth) {
        BigDecimal monto = null;
        if (cuerpo != null && cuerpo.get("monto") != null && !String.valueOf(cuerpo.get("monto")).isBlank()) {
            monto = new BigDecimal(String.valueOf(cuerpo.get("monto")));
        }
        PagoOnline po = mercadoPago.crearParaEstadia(estadiaId, monto, auth != null ? auth.getName() : "desconocido");
        return new ResponseEntity<>(ApiResponse.ok("Link de pago generado", po), HttpStatus.CREATED);
    }

    @GetMapping("/api/pagos/mercadopago")
    public ResponseEntity<ApiResponse<List<PagoOnline>>> recientes() {
        return ResponseEntity.ok(ApiResponse.ok(mercadoPago.recientes()));
    }

    @GetMapping("/api/pagos/mercadopago/{id}")
    public ResponseEntity<ApiResponse<PagoOnline>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(mercadoPago.obtener(id)));
    }

    // ---------- Público ----------

    /** Prepago de una reserva desde la web, con el código de la reserva. */
    @PostMapping("/api/publico/reservas/{codigo}/pagar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> pagarReserva(@PathVariable String codigo) {
        PagoOnline po = mercadoPago.crearParaReserva(codigo);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("urlPago", po.getUrlPago(), "monto", po.getMonto())));
    }

    /** La página de retorno del pago pide verificarlo (útil en local, donde el webhook no llega). */
    @PostMapping("/api/publico/mercadopago/verificar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verificar(@RequestParam("payment_id") String paymentId) {
        PagoOnline po = mercadoPago.procesarPago(paymentId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "estado", po.getEstado(),
                "monto", po.getMonto(),
                "descripcion", po.getDescripcion())));
    }

    /**
     * Notificación de Mercado Pago. Siempre responde 200 para que no reintente sin fin;
     * el pago se valida consultando la API de Mercado Pago, no con los datos recibidos.
     */
    @PostMapping("/api/publico/mercadopago/webhook")
    public ResponseEntity<Void> webhook(@RequestParam(value = "data.id", required = false) String dataIdParam,
                                        @RequestParam(value = "type", required = false) String tipoParam,
                                        @RequestBody(required = false) Map<String, Object> cuerpo,
                                        @RequestHeader(value = "x-signature", required = false) String firma,
                                        @RequestHeader(value = "x-request-id", required = false) String requestId) {
        String tipo = tipoParam;
        String dataId = dataIdParam;
        if (cuerpo != null) {
            if (tipo == null && cuerpo.get("type") != null) tipo = String.valueOf(cuerpo.get("type"));
            if (dataId == null && cuerpo.get("data") instanceof Map<?, ?> data && data.get("id") != null) {
                dataId = String.valueOf(data.get("id"));
            }
        }
        if (!"payment".equals(tipo) || dataId == null) {
            return ResponseEntity.ok().build();
        }
        if (!mercadoPago.firmaValida(firma, requestId, dataId)) {
            log.warn("Webhook de Mercado Pago con firma no válida para el pago {}", dataId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            mercadoPago.procesarPago(dataId);
        } catch (Exception e) {
            log.warn("No se pudo procesar el pago {}: {}", dataId, e.getMessage());
        }
        return ResponseEntity.ok().build();
    }
}
