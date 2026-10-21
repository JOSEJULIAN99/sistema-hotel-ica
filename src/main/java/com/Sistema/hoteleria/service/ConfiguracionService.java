package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.ConfiguracionNegocioDTO;
import com.Sistema.hoteleria.model.entity.ConfiguracionNegocio;
import com.Sistema.hoteleria.repository.ConfiguracionNegocioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Base de conocimiento del negocio para la IA. Si el administrador aún no la completó,
 * se crea con información por defecto que puede editar desde el panel.
 */
@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    private static final Long ID = 1L;

    private final ConfiguracionNegocioRepository repository;

    @Transactional
    public ConfiguracionNegocio obtenerEntidad() {
        return repository.findById(ID).orElseGet(() -> repository.save(porDefecto()));
    }

    @Transactional
    public ConfiguracionNegocioDTO obtener() {
        return aDTO(obtenerEntidad());
    }

    @Transactional
    public ConfiguracionNegocioDTO actualizar(ConfiguracionNegocioDTO dto, String usuario) {
        ConfiguracionNegocio c = obtenerEntidad();
        c.setNombreHotel(dto.getNombreHotel().trim());
        c.setDireccion(dto.getDireccion());
        c.setTelefono(dto.getTelefono());
        c.setEmail(dto.getEmail());
        c.setHoraCheckIn(dto.getHoraCheckIn());
        c.setHoraCheckOut(dto.getHoraCheckOut());
        c.setDescripcion(dto.getDescripcion());
        c.setServicios(dto.getServicios());
        c.setPoliticas(dto.getPoliticas());
        c.setTurismo(dto.getTurismo());
        c.setReglasAsistente(dto.getReglasAsistente());
        if (dto.getUmbralOcupacionAlta() != null) c.setUmbralOcupacionAlta(dto.getUmbralOcupacionAlta());
        if (dto.getAumentoOcupacionAlta() != null) c.setAumentoOcupacionAlta(dto.getAumentoOcupacionAlta());
        if (dto.getAumentoFeriado() != null) c.setAumentoFeriado(dto.getAumentoFeriado());
        if (dto.getAumentoFestividad() != null) c.setAumentoFestividad(dto.getAumentoFestividad());
        if (dto.getAumentoEvento() != null) c.setAumentoEvento(dto.getAumentoEvento());
        if (dto.getAumentoTemporadaAlta() != null) c.setAumentoTemporadaAlta(dto.getAumentoTemporadaAlta());
        if (dto.getAumentoMaximo() != null) c.setAumentoMaximo(dto.getAumentoMaximo());
        if (dto.getHorizonteDias() != null) c.setHorizonteDias(dto.getHorizonteDias());
        c.setActualizadoPor(usuario);
        return aDTO(repository.save(c));
    }

    /** Datos que puede ver cualquier visitante de la web. */
    @Transactional
    public Map<String, Object> datosPublicos() {
        ConfiguracionNegocio c = obtenerEntidad();
        Map<String, Object> datos = new LinkedHashMap<>();
        datos.put("nombreHotel", c.getNombreHotel());
        datos.put("direccion", c.getDireccion());
        datos.put("telefono", c.getTelefono());
        datos.put("email", c.getEmail());
        datos.put("horaCheckIn", c.getHoraCheckIn());
        datos.put("horaCheckOut", c.getHoraCheckOut());
        datos.put("descripcion", c.getDescripcion());
        datos.put("servicios", c.getServicios());
        return datos;
    }

    /** Texto con la información del negocio que se entrega a la IA como contexto. */
    @Transactional
    public String contextoNegocio() {
        ConfiguracionNegocio c = obtenerEntidad();
        return "DATOS DEL HOTEL\n"
                + "Nombre: " + texto(c.getNombreHotel()) + "\n"
                + "Dirección: " + texto(c.getDireccion()) + "\n"
                + "Teléfono de recepción: " + texto(c.getTelefono()) + "\n"
                + "Correo: " + texto(c.getEmail()) + "\n"
                + "Check-in desde: " + texto(c.getHoraCheckIn()) + " · Check-out hasta: " + texto(c.getHoraCheckOut()) + "\n"
                + "Descripción: " + texto(c.getDescripcion()) + "\n\n"
                + "SERVICIOS\n" + texto(c.getServicios()) + "\n\n"
                + "POLÍTICAS\n" + texto(c.getPoliticas()) + "\n\n"
                + "RECOMENDACIONES TURÍSTICAS DE ICA\n" + texto(c.getTurismo());
    }

    /** Reglas del motor de tarifas con valores por defecto si el administrador no las definió. */
    public record ReglasTarifa(int umbralOcupacionAlta, int aumentoOcupacionAlta, int aumentoFeriado,
                               int aumentoFestividad, int aumentoEvento, int aumentoTemporadaAlta,
                               int aumentoMaximo, int horizonteDias) { }

    public static ReglasTarifa reglas(ConfiguracionNegocio c) {
        return new ReglasTarifa(
                valor(c.getUmbralOcupacionAlta(), 75),
                valor(c.getAumentoOcupacionAlta(), 15),
                valor(c.getAumentoFeriado(), 20),
                valor(c.getAumentoFestividad(), 30),
                valor(c.getAumentoEvento(), 15),
                valor(c.getAumentoTemporadaAlta(), 10),
                valor(c.getAumentoMaximo(), 40),
                valor(c.getHorizonteDias(), 60));
    }

    @Transactional
    public ReglasTarifa reglasTarifa() {
        return reglas(obtenerEntidad());
    }

    private static int valor(Integer v, int porDefecto) {
        return v != null ? v : porDefecto;
    }

    /** Reglas de comportamiento que el administrador define para la IA. */
    @Transactional
    public String reglasAsistente() {
        return texto(obtenerEntidad().getReglasAsistente());
    }

    private static String texto(String valor) {
        return valor == null || valor.isBlank() ? "(no indicado)" : valor.trim();
    }

    private static ConfiguracionNegocioDTO aDTO(ConfiguracionNegocio c) {
        return ConfiguracionNegocioDTO.builder()
                .nombreHotel(c.getNombreHotel())
                .direccion(c.getDireccion())
                .telefono(c.getTelefono())
                .email(c.getEmail())
                .horaCheckIn(c.getHoraCheckIn())
                .horaCheckOut(c.getHoraCheckOut())
                .descripcion(c.getDescripcion())
                .servicios(c.getServicios())
                .politicas(c.getPoliticas())
                .turismo(c.getTurismo())
                .reglasAsistente(c.getReglasAsistente())
                .umbralOcupacionAlta(reglas(c).umbralOcupacionAlta())
                .aumentoOcupacionAlta(reglas(c).aumentoOcupacionAlta())
                .aumentoFeriado(reglas(c).aumentoFeriado())
                .aumentoFestividad(reglas(c).aumentoFestividad())
                .aumentoEvento(reglas(c).aumentoEvento())
                .aumentoTemporadaAlta(reglas(c).aumentoTemporadaAlta())
                .aumentoMaximo(reglas(c).aumentoMaximo())
                .horizonteDias(reglas(c).horizonteDias())
                .actualizadoPor(c.getActualizadoPor())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    /** Información por defecto: el administrador debe revisarla y completarla. */
    static ConfiguracionNegocio porDefecto() {
        return ConfiguracionNegocio.builder()
                .id(ID)
                .nombreHotel("Hotel Princes Ica")
                .direccion("Ica, Perú")
                .telefono("")
                .email("reservas@hotelprincesica.com")
                .horaCheckIn("14:00")
                .horaCheckOut("12:00")
                .descripcion("Hotel en la ciudad de Ica, cerca del centro y del oasis de Huacachina. "
                        + "Habitaciones individuales, dobles, matrimoniales, familiares y suites con baño privado y aire acondicionado.")
                .servicios("Recepción 24 horas. WiFi gratuito en todo el hotel. Piscina al aire libre. "
                        + "Desayuno de 6:30 a 10:00 (incluido según la tarifa). Estacionamiento. Lavandería. "
                        + "Room service. Traslados al terminal y a Huacachina con costo adicional.")
                .politicas("Check-in desde las 14:00 y check-out hasta las 12:00. "
                        + "Cancelación sin penalidad hasta 48 horas antes de la llegada; después se cobra la primera noche. "
                        + "Niños menores de 5 años no pagan si comparten cama con sus padres. No se admiten mascotas. "
                        + "Pagos en efectivo, tarjeta, Yape, Plin y Mercado Pago. Se pide DNI o pasaporte al ingresar.")
                .turismo("Huacachina: oasis rodeado de dunas; paseos en tubulares y sandboarding, mejor por la tarde y al atardecer. "
                        + "Bodegas de pisco y vino del valle de Ica: recorridos con degustación. "
                        + "Paracas e Islas Ballestas: alrededor de una hora en auto; los paseos en lancha salen por la mañana. "
                        + "Museo Regional de Ica y Santuario del Señor de Luren en la ciudad. "
                        + "Festival de la Vendimia en marzo: alta demanda, reservar con anticipación.")
                .reglasAsistente("Responde con amabilidad, en pocas oraciones y en el idioma del huésped. "
                        + "No inventes precios, disponibilidad ni promociones. No ofrezcas descuentos: si los piden, deriva a recepción. "
                        + "Para reservar, indica el botón Reservar de la web o el teléfono de recepción. "
                        + "Ante quejas, emergencias o temas que no conoces, deriva a recepción.")
                .actualizadoPor("sistema")
                .build();
    }
}
