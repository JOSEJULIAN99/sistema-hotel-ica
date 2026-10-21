package com.Sistema.hoteleria.service.ia;

import com.Sistema.hoteleria.dto.ChatRequestDTO;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.service.ConfiguracionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Chatbot público 24/7 (RF-10). Responde con la base de conocimiento que el administrador
 * mantiene en el panel y con los precios base de la base de datos. No confirma disponibilidad
 * ni reservas: para eso deriva al botón Reservar o a recepción.
 */
@Service
@RequiredArgsConstructor
public class ChatHuespedService {

    private final ClienteModeloIA clienteIA;
    private final ConfiguracionService configuracionService;
    private final HabitacionRepository habitacionRepository;

    @Transactional
    public Map<String, Object> responder(ChatRequestDTO req) {
        List<ClienteModeloIA.Mensaje> historial = req.getMensajes().stream()
                .map(m -> new ClienteModeloIA.Mensaje("asistente".equalsIgnoreCase(m.getRol()) ? "assistant" : "user",
                        m.getContenido().trim()))
                .toList();
        String ultimo = historial.get(historial.size() - 1).contenido();

        String instruccion = "Eres el asistente virtual del hotel y atiendes huéspedes y turistas las 24 horas.\n"
                + "Responde SIEMPRE en el mismo idioma en que escribe el huésped (español, inglés, portugués u otro).\n"
                + "Usa solo la información de abajo. Si no está, dilo con amabilidad y sugiere contactar a recepción.\n"
                + "No confirmes disponibilidad ni reservas: para reservar, el huésped usa el botón Reservar de la web.\n"
                + "Los precios son tarifas base por noche y pueden variar en feriados y festividades.\n"
                + "Fecha de hoy: " + LocalDate.now() + ".\n\n"
                + "REGLAS DEL HOTEL PARA EL ASISTENTE\n" + configuracionService.reglasAsistente() + "\n\n"
                + configuracionService.contextoNegocio() + "\n\n"
                + "TIPOS DE HABITACIÓN (tarifa base desde)\n" + resumenHabitaciones();

        return clienteIA.conversar(instruccion, historial)
                .map(texto -> respuesta(texto, "IA"))
                .orElseGet(() -> respuesta(respuestaPorReglas(ultimo), "REGLAS"));
    }

    private static Map<String, Object> respuesta(String texto, String fuente) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("respuesta", texto);
        r.put("fuente", fuente);
        return r;
    }

    /** Precio base mínimo y capacidad por tipo, sin habitaciones en mantenimiento. */
    private String resumenHabitaciones() {
        Map<TipoHabitacion, List<Habitacion>> porTipo = habitacionRepository.findAll().stream()
                .filter(h -> h.getEstado() != EstadoHabitacion.MANTENIMIENTO)
                .collect(Collectors.groupingBy(Habitacion::getTipo, TreeMap::new, Collectors.toList()));
        if (porTipo.isEmpty()) {
            return "(sin habitaciones registradas)";
        }
        return porTipo.entrySet().stream()
                .map(e -> {
                    BigDecimal desde = e.getValue().stream().map(Habitacion::getPrecioPorNoche)
                            .min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
                    int capacidad = e.getValue().stream().mapToInt(Habitacion::getCapacidad).max().orElse(0);
                    return "- " + e.getKey() + ": desde S/ " + desde + " por noche, hasta " + capacidad + " persona(s)";
                })
                .collect(Collectors.joining("\n"));
    }

    /** Respuestas básicas cuando no hay IA configurada (en español). */
    private String respuestaPorReglas(String pregunta) {
        String p = normalizar(pregunta);
        var c = configuracionService.obtenerEntidad();
        String telefono = c.getTelefono() != null && !c.getTelefono().isBlank()
                ? " al " + c.getTelefono() : " en recepción";
        if (contiene(p, "check", "hora", "entrada", "salida", "horario")) {
            return "El check-in es desde las " + c.getHoraCheckIn() + " y el check-out hasta las " + c.getHoraCheckOut() + ".";
        }
        if (contiene(p, "precio", "tarifa", "cuesta", "costo", "price", "cost")) {
            return "Estas son nuestras tarifas base por noche:\n" + resumenHabitaciones()
                    + "\nPueden variar en feriados y festividades. Para reservar use el botón Reservar.";
        }
        if (contiene(p, "servicio", "piscina", "wifi", "desayuno", "estacionamiento", "pool", "breakfast")) {
            return c.getServicios();
        }
        if (contiene(p, "cancel", "politica", "mascota", "nino", "pago", "pagar", "yape")) {
            return c.getPoliticas();
        }
        if (contiene(p, "turis", "visitar", "huacachina", "paracas", "ballestas", "bodega", "pisco", "lugar", "tour")) {
            return c.getTurismo();
        }
        if (contiene(p, "reserv", "disponib", "book")) {
            return "Puede reservar con el botón Reservar de nuestra web; recepción confirma su solicitud. "
                    + "También puede comunicarse" + telefono + ".";
        }
        return "Gracias por escribirnos. Puedo ayudarle con horarios, tarifas, servicios, políticas y lugares para visitar en Ica. "
                + "Para otras consultas comuníquese" + telefono + ".";
    }

    private static boolean contiene(String texto, String... palabras) {
        for (String palabra : palabras) {
            if (texto.contains(palabra)) {
                return true;
            }
        }
        return false;
    }

    private static String normalizar(String texto) {
        return Normalizer.normalize(texto.toLowerCase(Locale.ROOT), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    }
}
