package com.Sistema.hoteleria.service.ia;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Cliente mínimo de la API de mensajes de Anthropic (Claude).
 * Si no hay clave configurada (ANTHROPIC_API_KEY) o la llamada falla, devuelve vacío
 * y el asistente responde solo con reglas. El sistema nunca depende de la IA para operar.
 */
@Slf4j
@Component
public class ClienteModeloIA {

    private final RestClient restClient;
    private final String url;
    private final String apiKey;
    private final String modelo;
    private final int maxTokens;

    public ClienteModeloIA(RestClient.Builder builder,
                           @Value("${asistente.ia.api-key:}") String apiKey,
                           @Value("${asistente.ia.url:https://api.anthropic.com/v1/messages}") String url,
                           @Value("${asistente.ia.modelo:claude-haiku-5-5}") String modelo,
                           @Value("${asistente.ia.max-tokens:600}") int maxTokens) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(20));
        this.restClient = builder.requestFactory(factory).build();
        this.url = url;
        this.apiKey = apiKey;
        this.modelo = modelo;
        this.maxTokens = maxTokens;
    }

    public boolean habilitado() {
        return apiKey != null && !apiKey.isBlank();
    }

    /** Envía una instrucción de sistema y un mensaje; devuelve el texto de la respuesta. */
    @SuppressWarnings("unchecked")
    public Optional<String> completar(String instruccionSistema, String mensaje) {
        if (!habilitado()) {
            return Optional.empty();
        }
        try {
            Map<String, Object> cuerpo = Map.of(
                    "model", modelo,
                    "max_tokens", maxTokens,
                    "system", instruccionSistema,
                    "messages", List.of(Map.of("role", "user", "content", mensaje)));

            Map<String, Object> respuesta = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .body(cuerpo)
                    .retrieve()
                    .body(Map.class);

            if (respuesta == null || !(respuesta.get("content") instanceof List<?> bloques)) {
                return Optional.empty();
            }
            StringBuilder texto = new StringBuilder();
            for (Object bloque : bloques) {
                if (bloque instanceof Map<?, ?> b && "text".equals(b.get("type")) && b.get("text") != null) {
                    texto.append(b.get("text"));
                }
            }
            return texto.isEmpty() ? Optional.empty() : Optional.of(texto.toString().trim());
        } catch (Exception e) {
            log.warn("El modelo de IA no respondió; se usan reglas. Motivo: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
