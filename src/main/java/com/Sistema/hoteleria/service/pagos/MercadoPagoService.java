package com.Sistema.hoteleria.service.pagos;

import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.exception.ServicioNoDisponibleException;
import com.Sistema.hoteleria.model.entity.Estadia;
import com.Sistema.hoteleria.model.entity.Pago;
import com.Sistema.hoteleria.model.entity.PagoOnline;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import com.Sistema.hoteleria.model.enums.EstadoPagoOnline;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.model.enums.MetodoPago;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.PagoOnlineRepository;
import com.Sistema.hoteleria.repository.PagoRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Pasarela Mercado Pago (RF-03) con Checkout Pro.
 * 1. Recepción (o el huésped en la web) genera un link de pago: se crea una "preferencia".
 * 2. El huésped paga con tarjeta o billetera en la página de Mercado Pago.
 * 3. Mercado Pago avisa por webhook; el sistema CONSULTA el pago en la API de Mercado Pago
 *    (no confía en lo que llega en la notificación) y solo si está aprobado registra el Pago.
 * Con credenciales TEST- todo funciona en modo de prueba (sandbox), sin dinero real.
 */
@Slf4j
@Service
public class MercadoPagoService {

    private static final String API = "https://api.mercadopago.com";

    private final RestClient restClient;
    private final PagoOnlineRepository pagoOnlineRepository;
    private final EstadiaRepository estadiaRepository;
    private final ReservacionRepository reservacionRepository;
    private final PagoRepository pagoRepository;
    private final String accessToken;
    private final String secretoWebhook;
    private final String urlFrontend;
    private final String urlBackendPublica;

    public MercadoPagoService(RestClient.Builder builder,
                              PagoOnlineRepository pagoOnlineRepository,
                              EstadiaRepository estadiaRepository,
                              ReservacionRepository reservacionRepository,
                              PagoRepository pagoRepository,
                              @Value("${mercadopago.access-token:}") String accessToken,
                              @Value("${mercadopago.webhook-secret:}") String secretoWebhook,
                              @Value("${app.frontend-url:http://localhost:3000}") String urlFrontend,
                              @Value("${app.backend-public-url:}") String urlBackendPublica) {
        this.restClient = builder.build();
        this.pagoOnlineRepository = pagoOnlineRepository;
        this.estadiaRepository = estadiaRepository;
        this.reservacionRepository = reservacionRepository;
        this.pagoRepository = pagoRepository;
        this.accessToken = accessToken;
        this.secretoWebhook = secretoWebhook;
        this.urlFrontend = sinBarra(urlFrontend);
        this.urlBackendPublica = sinBarra(urlBackendPublica);
    }

    private static String sinBarra(String url) {
        return url != null && url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public boolean configurado() {
        return accessToken != null && !accessToken.isBlank();
    }

    public boolean modoPrueba() {
        return configurado() && accessToken.startsWith("TEST-");
    }

    // ==================== CREAR LINK DE PAGO ====================

    /** Cobro del saldo (o parte) de una estadía activa. */
    @Transactional
    public PagoOnline crearParaEstadia(Long estadiaId, BigDecimal monto, String usuario) {
        exigirConfiguracion();
        Estadia e = estadiaRepository.findById(estadiaId)
                .orElseThrow(() -> new ResourceNotFoundException("Estadía", "id", estadiaId));
        if (e.getEstado() != EstadoEstadia.ACTIVA) {
            throw new BadRequestException("Solo se cobra en línea una estadía activa");
        }
        BigDecimal saldo = e.getSaldoPendiente();
        BigDecimal cobrar = monto != null ? monto : saldo;
        if (cobrar.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("La estadía no tiene saldo pendiente");
        }
        if (cobrar.compareTo(saldo) > 0) {
            throw new BadRequestException("El monto supera el saldo pendiente (S/ " + saldo + ")");
        }
        PagoOnline po = pagoOnlineRepository.save(PagoOnline.builder()
                .estadia(e)
                .monto(cobrar.setScale(2, RoundingMode.HALF_UP))
                .descripcion("Hospedaje habitación " + e.getHabitacion().getNumero())
                .creadoPor(usuario)
                .build());
        return crearPreferencia(po);
    }

    /** Prepago de una reserva desde la web pública (por su código). */
    @Transactional
    public PagoOnline crearParaReserva(String codigoReserva) {
        exigirConfiguracion();
        Reservacion r = reservacionRepository.findByCodigoReserva(codigoReserva.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Reservación", "código", codigoReserva));
        if (r.getEstado() != EstadoReservacion.PENDIENTE && r.getEstado() != EstadoReservacion.CONFIRMADA) {
            throw new BadRequestException("La reservación no admite pagos en su estado actual");
        }
        BigDecimal pendiente = r.getPrecioTotal().subtract(r.getAdelanto() != null ? r.getAdelanto() : BigDecimal.ZERO);
        if (pendiente.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("La reservación ya está pagada");
        }
        PagoOnline po = pagoOnlineRepository.save(PagoOnline.builder()
                .reservacion(r)
                .monto(pendiente.setScale(2, RoundingMode.HALF_UP))
                .descripcion("Reserva " + r.getCodigoReserva() + " · habitación " + r.getHabitacion().getNumero())
                .creadoPor("web")
                .build());
        return crearPreferencia(po);
    }

    @SuppressWarnings("unchecked")
    private PagoOnline crearPreferencia(PagoOnline po) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("title", po.getDescripcion());
        item.put("quantity", 1);
        item.put("unit_price", po.getMonto());
        item.put("currency_id", "PEN");

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("items", List.of(item));
        cuerpo.put("external_reference", po.referenciaExterna());
        cuerpo.put("statement_descriptor", "HOTEL PRINCES ICA");
        String retorno = urlFrontend + "/pago/resultado";
        cuerpo.put("back_urls", Map.of("success", retorno, "failure", retorno, "pending", retorno));
        if (retorno.startsWith("https://")) {
            cuerpo.put("auto_return", "approved");
        }
        // Mercado Pago solo puede notificar a una URL pública (en local se verifica al volver del pago)
        if (urlBackendPublica != null && urlBackendPublica.startsWith("https://")) {
            cuerpo.put("notification_url", urlBackendPublica + "/api/publico/mercadopago/webhook");
        }

        Map<String, Object> respuesta;
        try {
            respuesta = restClient.post()
                    .uri(API + "/checkout/preferences")
                    .header("Authorization", "Bearer " + accessToken)
                    .header("X-Idempotency-Key", UUID.randomUUID().toString())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(cuerpo)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            log.warn("Mercado Pago rechazó la preferencia: {}", e.getMessage());
            throw new ServicioNoDisponibleException("Mercado Pago no respondió. Cobre en recepción o intente de nuevo.");
        }
        if (respuesta == null || respuesta.get("id") == null) {
            throw new ServicioNoDisponibleException("Mercado Pago no devolvió el link de pago");
        }
        po.setPreferenciaId(String.valueOf(respuesta.get("id")));
        Object url = modoPrueba() && respuesta.get("sandbox_init_point") != null
                ? respuesta.get("sandbox_init_point") : respuesta.get("init_point");
        po.setUrlPago(url != null ? url.toString() : null);
        return pagoOnlineRepository.save(po);
    }

    private void exigirConfiguracion() {
        if (!configurado()) {
            throw new ServicioNoDisponibleException("Mercado Pago no está configurado (MP_ACCESS_TOKEN en el .env)");
        }
    }

    // ==================== CONFIRMAR PAGO ====================

    /** Verifica la firma del webhook si hay secreto configurado (encabezado x-signature de Mercado Pago). */
    public boolean firmaValida(String xSignature, String xRequestId, String dataId) {
        if (secretoWebhook == null || secretoWebhook.isBlank()) {
            return true; // sin secreto no se valida la firma; igual se consulta el pago a la API
        }
        if (xSignature == null || dataId == null) {
            return false;
        }
        String ts = null;
        String v1 = null;
        for (String parte : xSignature.split(",")) {
            String[] kv = parte.trim().split("=", 2);
            if (kv.length == 2 && kv[0].equals("ts")) ts = kv[1];
            if (kv.length == 2 && kv[0].equals("v1")) v1 = kv[1];
        }
        if (ts == null || v1 == null) {
            return false;
        }
        String manifiesto = "id:" + dataId.toLowerCase() + ";" + (xRequestId != null ? "request-id:" + xRequestId + ";" : "") + "ts:" + ts + ";";
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretoWebhook.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String esperado = HexFormat.of().formatHex(mac.doFinal(manifiesto.getBytes(StandardCharsets.UTF_8)));
            return MessageDigest.isEqual(esperado.getBytes(StandardCharsets.UTF_8), v1.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Consulta el pago en la API de Mercado Pago y, si está aprobado, lo registra (idempotente).
     * Se llama desde el webhook y desde la página de retorno del pago.
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public PagoOnline procesarPago(String paymentId) {
        exigirConfiguracion();
        if (paymentId == null || !paymentId.matches("\\d{1,30}")) {
            throw new BadRequestException("Identificador de pago no válido");
        }
        Map<String, Object> pago;
        try {
            pago = restClient.get()
                    .uri(API + "/v1/payments/" + paymentId)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new ServicioNoDisponibleException("No se pudo consultar el pago en Mercado Pago");
        }
        if (pago == null) {
            throw new ServicioNoDisponibleException("Mercado Pago no devolvió el pago");
        }
        String referencia = String.valueOf(pago.get("external_reference"));
        if (!referencia.startsWith("PO-")) {
            throw new BadRequestException("El pago no pertenece a este sistema");
        }
        Long id;
        try {
            id = Long.valueOf(referencia.substring(3));
        } catch (NumberFormatException e) {
            throw new BadRequestException("Referencia de pago no válida");
        }
        PagoOnline po = pagoOnlineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago en línea", "id", id));
        if (po.getEstado() == EstadoPagoOnline.APROBADO) {
            return po; // ya registrado: la notificación puede llegar más de una vez
        }

        String estado = String.valueOf(pago.get("status"));
        po.setMpPaymentId(paymentId);
        po.setMpEstadoDetalle(String.valueOf(pago.get("status_detail")));
        po.setMedioPago(String.valueOf(pago.get("payment_method_id")));

        if ("approved".equals(estado)) {
            BigDecimal pagado = new BigDecimal(String.valueOf(pago.get("transaction_amount")));
            if (pagado.compareTo(po.getMonto().subtract(new BigDecimal("0.01"))) < 0) {
                po.setMpEstadoDetalle("monto_incompleto");
                log.warn("Pago {} aprobado por un monto menor ({}) al esperado ({})", paymentId, pagado, po.getMonto());
                return pagoOnlineRepository.save(po);
            }
            registrarAprobado(po, paymentId);
            po.setEstado(EstadoPagoOnline.APROBADO);
        } else if ("rejected".equals(estado) || "cancelled".equals(estado) || "refunded".equals(estado)) {
            po.setEstado(EstadoPagoOnline.RECHAZADO);
        }
        return pagoOnlineRepository.save(po);
    }

    private void registrarAprobado(PagoOnline po, String paymentId) {
        if (po.getEstadia() != null) {
            Estadia e = po.getEstadia();
            Pago pago = pagoRepository.save(Pago.builder()
                    .estadia(e)
                    .monto(po.getMonto())
                    .metodoPago(MetodoPago.MERCADO_PAGO)
                    .fechaPago(LocalDateTime.now())
                    .nroOperacion(paymentId)
                    .tipoComprobante("BOLETA")
                    .notas("Pago en línea Mercado Pago (" + po.getMedioPago() + ")")
                    .build());
            e.getPagos().add(pago);
        } else if (po.getReservacion() != null) {
            Reservacion r = po.getReservacion();
            BigDecimal adelanto = r.getAdelanto() != null ? r.getAdelanto() : BigDecimal.ZERO;
            r.setAdelanto(adelanto.add(po.getMonto()));
            if (r.getEstado() == EstadoReservacion.PENDIENTE) {
                r.setEstado(EstadoReservacion.CONFIRMADA);
            }
            r.setObservaciones((r.getObservaciones() != null ? r.getObservaciones() + " | " : "")
                    + "Pagado en línea con Mercado Pago, operación " + paymentId);
            reservacionRepository.save(r);
        }
    }

    @Transactional(readOnly = true)
    public PagoOnline obtener(Long id) {
        return pagoOnlineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago en línea", "id", id));
    }

    @Transactional(readOnly = true)
    public List<PagoOnline> recientes() {
        return pagoOnlineRepository.findTop50ByOrderByFechaCreacionDesc();
    }
}
