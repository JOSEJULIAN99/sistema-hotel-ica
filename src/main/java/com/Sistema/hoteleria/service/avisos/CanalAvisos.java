package com.Sistema.hoteleria.service.avisos;

import com.Sistema.hoteleria.model.enums.RolUsuario;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Conexiones abiertas de Server-Sent Events. Cada pestaña del panel queda suscrita y recibe
 * los avisos de su rol al instante, sin recargar. El navegador se reconecta solo si se corta.
 */
@Slf4j
@Component
public class CanalAvisos {

    private static final long DURACION_MS = 30L * 60 * 1000;

    private record Suscripcion(SseEmitter emisor, String usuario, RolUsuario rol) { }

    private final List<Suscripcion> suscripciones = new CopyOnWriteArrayList<>();

    public SseEmitter suscribir(String usuario, RolUsuario rol) {
        SseEmitter emisor = new SseEmitter(DURACION_MS);
        Suscripcion s = new Suscripcion(emisor, usuario, rol);
        suscripciones.add(s);
        emisor.onCompletion(() -> suscripciones.remove(s));
        emisor.onTimeout(() -> suscripciones.remove(s));
        emisor.onError(e -> suscripciones.remove(s));
        try {
            emisor.send(SseEmitter.event().name("conectado").data("ok"));
        } catch (IOException e) {
            suscripciones.remove(s);
        }
        return emisor;
    }

    /** Envía a quienes tengan el rol destino (null = todos); administración y gerencia ven todos. */
    public void enviar(Object aviso, RolUsuario rolDestino) {
        for (Suscripcion s : suscripciones) {
            boolean corresponde = rolDestino == null || s.rol() == rolDestino
                    || s.rol() == RolUsuario.ADMINISTRADOR || s.rol() == RolUsuario.GERENTE;
            if (!corresponde) {
                continue;
            }
            try {
                s.emisor().send(SseEmitter.event().name("aviso").data(aviso, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                suscripciones.remove(s);
            }
        }
    }

    /** Mantiene vivas las conexiones a través de proxies que cortan las inactivas. */
    @Scheduled(fixedRate = 25_000)
    public void latido() {
        for (Suscripcion s : suscripciones) {
            try {
                s.emisor().send(SseEmitter.event().comment("latido"));
            } catch (Exception e) {
                suscripciones.remove(s);
            }
        }
    }

    public int conectados() {
        return suscripciones.size();
    }
}
