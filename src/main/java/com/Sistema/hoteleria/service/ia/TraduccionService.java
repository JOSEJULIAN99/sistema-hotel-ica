package com.Sistema.hoteleria.service.ia;

import com.Sistema.hoteleria.dto.TraduccionRequestDTO;
import com.Sistema.hoteleria.exception.ServicioNoDisponibleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Traducción automática (RF-11): mensajes de turistas extranjeros al español y respuestas
 * del personal al idioma del huésped. Requiere un modelo de IA configurado.
 */
@Service
@RequiredArgsConstructor
public class TraduccionService {

    private static final String INSTRUCCION =
            "Eres un traductor profesional de un hotel en Perú. Traduce fielmente, con tono cordial, "
            + "sin agregar ni quitar información y conservando nombres, números, fechas y montos.\n"
            + "Responde EXACTAMENTE con este formato de dos líneas:\n"
            + "IDIOMA_ORIGEN: <nombre del idioma original en español>\n"
            + "TRADUCCION: <texto traducido>";

    private final ClienteModeloIA clienteIA;

    public Map<String, Object> traducir(TraduccionRequestDTO req) {
        if (!clienteIA.habilitado()) {
            throw new ServicioNoDisponibleException(
                    "La traducción necesita la IA configurada (IA_PROVEEDOR=groq u ollama en el .env)");
        }
        String pedido = "Traduce al " + req.getIdiomaDestino().trim() + " el siguiente texto:\n\n" + req.getTexto().trim();
        String salida = clienteIA.completar(INSTRUCCION, pedido)
                .orElseThrow(() -> new ServicioNoDisponibleException(
                        "El servicio de IA no respondió. Intente nuevamente en unos segundos."));

        String idiomaOrigen = null;
        String traduccion = salida;
        int i = salida.indexOf("TRADUCCION:");
        if (i >= 0) {
            traduccion = salida.substring(i + "TRADUCCION:".length()).trim();
            int j = salida.indexOf("IDIOMA_ORIGEN:");
            if (j >= 0 && j < i) {
                idiomaOrigen = salida.substring(j + "IDIOMA_ORIGEN:".length(), i).trim();
            }
        }

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("traduccion", traduccion);
        r.put("idiomaOrigen", idiomaOrigen);
        r.put("idiomaDestino", req.getIdiomaDestino().trim());
        return r;
    }
}
