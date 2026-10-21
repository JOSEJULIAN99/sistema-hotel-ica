package com.Sistema.hoteleria.security;

import com.Sistema.hoteleria.exception.TooManyRequestsException;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Límite simple de solicitudes por visitante (ventana de 60 s, en memoria).
 * Protege el chatbot público para no agotar la capa gratuita de la IA.
 */
@Component
public class LimitadorSolicitudes {

    private static final long VENTANA_MS = 60_000;
    private final Map<String, Deque<Long>> registros = new ConcurrentHashMap<>();

    public void verificar(String clave, int maximoPorMinuto) {
        long ahora = System.currentTimeMillis();
        Deque<Long> marcas = registros.computeIfAbsent(clave, k -> new ArrayDeque<>());
        synchronized (marcas) {
            while (!marcas.isEmpty() && ahora - marcas.peekFirst() > VENTANA_MS) {
                marcas.pollFirst();
            }
            if (marcas.size() >= maximoPorMinuto) {
                throw new TooManyRequestsException("Ha enviado muchos mensajes seguidos. Espere un minuto e intente de nuevo.");
            }
            marcas.addLast(ahora);
        }
        if (registros.size() > 10_000) {
            registros.clear();
        }
    }
}
