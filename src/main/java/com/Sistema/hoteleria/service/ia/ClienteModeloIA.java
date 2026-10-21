package com.Sistema.hoteleria.service.ia;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Cliente de IA generativa libre (Llama) con la API compatible con OpenAI (/chat/completions).
 * Proveedores (variable IA_PROVEEDOR):
 * - groq   : Llama 3.3 70B en la nube, capa gratuita (requiere IA_API_KEY).
 * - ollama : Llama 3.2 en local con Docker (--profile ia-local), sin clave ni costo.
 * - ninguno: sin IA; el sistema responde con reglas.
 * Si la llamada falla, devuelve vacío y quien llama usa sus reglas. El sistema nunca depende de la IA.
 */
@Slf4j
@Component
public class ClienteModeloIA {

    /** Mensaje de una conversación: rol "user" o "assistant". */
    public record Mensaje(String rol, String contenido) { }

    private final RestClient restClient;
    private final String proveedor;
    private final String urlBase;
    private final String apiKey;
    private final String modelo;
    private final int maxTokens;
    private final double temperatura;

    // Métricas para el panel de monitoreo
    private final AtomicLong llamadasOk = new AtomicLong();
    private final AtomicLong llamadasError = new AtomicLong();
    private volatile long ultimaLatenciaMs = -1;
    private volatile String ultimoError = null;

    public ClienteModeloIA(RestClient.Builder builder,
                           @Value("${ia.proveedor:ninguno}") String proveedor,
                           @Value("${ia.base-url:}") String urlBase,
                           @Value("${ia.api-key:}") String apiKey,
                           @Value("${ia.modelo:}") String modelo,
                           @Value("${ia.max-tokens:700}") int maxTokens,
                           @Value("${ia.temperatura:0.4}") double temperatura) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(45));
        this.restClient = builder.requestFactory(factory).build();
        this.proveedor = proveedor == null ? "ninguno" : proveedor.trim().toLowerCase();
        this.urlBase = quitarBarra(!urlBase.isBlank() ? urlBase : urlPorDefecto(this.proveedor));
        this.apiKey = apiKey;
        this.modelo = !modelo.isBlank() ? modelo : modeloPorDefecto(this.proveedor);
        this.maxTokens = maxTokens;
        this.temperatura = temperatura;
    }

    private static String urlPorDefecto(String proveedor) {
        return switch (proveedor) {
            case "groq" -> "https://api.groq.com/openai/v1";
            case "ollama" -> "http://ollama:11434/v1";
            default -> "";
        };
    }

    private static String modeloPorDefecto(String proveedor) {
        return switch (proveedor) {
            case "groq" -> "llama-3.3-70b-versatile";
            case "ollama" -> "llama3.2:3b";
            default -> "";
        };
    }

    private static String quitarBarra(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public boolean habilitado() {
        return switch (proveedor) {
            case "groq" -> apiKey != null && !apiKey.isBlank();
            case "ollama" -> !urlBase.isBlank();
            default -> false;
        };
    }

    /** Una instrucción de sistema y un mensaje del usuario. */
    public Optional<String> completar(String instruccionSistema, String mensaje) {
        return conversar(instruccionSistema, List.of(new Mensaje("user", mensaje)));
    }

    /** Conversación completa (chatbot): instrucción de sistema + historial. */
    @SuppressWarnings("unchecked")
    public Optional<String> conversar(String instruccionSistema, List<Mensaje> historial) {
        if (!habilitado()) {
            return Optional.empty();
        }
        long inicio = System.currentTimeMillis();
        try {
            List<Map<String, Object>> mensajes = new ArrayList<>();
            mensajes.add(Map.of("role", "system", "content", instruccionSistema));
            for (Mensaje m : historial) {
                mensajes.add(Map.of("role", "assistant".equals(m.rol()) ? "assistant" : "user", "content", m.contenido()));
            }
            Map<String, Object> cuerpo = new HashMap<>();
            cuerpo.put("model", modelo);
            cuerpo.put("messages", mensajes);
            cuerpo.put("max_tokens", maxTokens);
            cuerpo.put("temperature", temperatura);

            RestClient.RequestBodySpec peticion = restClient.post()
                    .uri(urlBase + "/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isBlank()) {
                peticion = peticion.header("Authorization", "Bearer " + apiKey);
            }
            Map<String, Object> respuesta = peticion.body(cuerpo).retrieve().body(Map.class);

            String texto = extraerTexto(respuesta);
            ultimaLatenciaMs = System.currentTimeMillis() - inicio;
            if (texto == null || texto.isBlank()) {
                registrarError("respuesta vacía del modelo");
                return Optional.empty();
            }
            llamadasOk.incrementAndGet();
            ultimoError = null;
            return Optional.of(texto.trim());
        } catch (Exception e) {
            ultimaLatenciaMs = System.currentTimeMillis() - inicio;
            registrarError(e.getMessage());
            log.warn("La IA ({}) no respondió; se usan reglas. Motivo: {}", proveedor, e.getMessage());
            return Optional.empty();
        }
    }

    private void registrarError(String motivo) {
        llamadasError.incrementAndGet();
        ultimoError = motivo;
    }

    private static String extraerTexto(Map<String, Object> respuesta) {
        if (respuesta == null || !(respuesta.get("choices") instanceof List<?> opciones) || opciones.isEmpty()) {
            return null;
        }
        if (opciones.get(0) instanceof Map<?, ?> opcion && opcion.get("message") instanceof Map<?, ?> mensaje
                && mensaje.get("content") != null) {
            return mensaje.get("content").toString();
        }
        return null;
    }

    public String getProveedor() { return proveedor; }
    public String getModelo() { return modelo; }
    public long getLlamadasOk() { return llamadasOk.get(); }
    public long getLlamadasError() { return llamadasError.get(); }
    public long getUltimaLatenciaMs() { return ultimaLatenciaMs; }
    public String getUltimoError() { return ultimoError; }
}
