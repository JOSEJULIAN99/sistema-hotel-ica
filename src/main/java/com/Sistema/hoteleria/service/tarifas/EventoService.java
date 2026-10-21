package com.Sistema.hoteleria.service.tarifas;

import com.Sistema.hoteleria.dto.EventoDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.EventoCalendario;
import com.Sistema.hoteleria.model.enums.TipoEvento;
import com.Sistema.hoteleria.repository.EventoCalendarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Calendario de feriados, festividades de Ica y eventos para decidir precios. */
@Service
@RequiredArgsConstructor
public class EventoService {

    private static final String VERIFICAR = "Fecha referencial: confirmar con el calendario oficial.";

    private final EventoCalendarioRepository repository;

    @Transactional(readOnly = true)
    public List<EventoDTO> listar() {
        return repository.findAllByOrderByFechaInicioAsc().stream().map(EventoService::aDTO).toList();
    }

    @Transactional
    public EventoDTO crear(EventoDTO dto, String usuario) {
        validar(dto);
        EventoCalendario e = new EventoCalendario();
        copiar(dto, e);
        e.setCreadoPor(usuario);
        return aDTO(repository.save(e));
    }

    @Transactional
    public EventoDTO actualizar(Long id, EventoDTO dto) {
        validar(dto);
        EventoCalendario e = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento", "id", id));
        copiar(dto, e);
        return aDTO(repository.save(e));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Evento", "id", id);
        }
        repository.deleteById(id);
    }

    private static void validar(EventoDTO dto) {
        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new BadRequestException("La fecha de fin debe ser igual o posterior a la de inicio");
        }
    }

    private static void copiar(EventoDTO dto, EventoCalendario e) {
        e.setNombre(dto.getNombre().trim());
        e.setTipo(dto.getTipo());
        e.setFechaInicio(dto.getFechaInicio());
        e.setFechaFin(dto.getFechaFin());
        e.setPorcentajeSugerido(dto.getPorcentajeSugerido());
        e.setDescripcion(dto.getDescripcion());
        e.setActivo(dto.getActivo() == null || dto.getActivo());
    }

    static EventoDTO aDTO(EventoCalendario e) {
        return EventoDTO.builder()
                .id(e.getId()).nombre(e.getNombre()).tipo(e.getTipo())
                .fechaInicio(e.getFechaInicio()).fechaFin(e.getFechaFin())
                .porcentajeSugerido(e.getPorcentajeSugerido()).descripcion(e.getDescripcion())
                .activo(e.getActivo()).creadoPor(e.getCreadoPor())
                .build();
    }

    /** Carga el calendario por defecto la primera vez (el administrador puede editarlo o borrarlo). */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void cargarPorDefecto() {
        if (repository.count() > 0) {
            return;
        }
        List<EventoCalendario> eventos = new ArrayList<>();
        // Feriados nacionales restantes de 2026 (calendario oficial publicado)
        eventos.add(feriado("Día de Todos los Santos", "2026-11-01", "2026-11-01"));
        eventos.add(feriado("Inmaculada Concepción y Batalla de Ayacucho", "2026-12-08", "2026-12-09"));
        eventos.add(feriado("Navidad", "2026-12-25", "2026-12-25"));
        // Feriados nacionales 2027 (fechas fijas; Semana Santa según el calendario lunar)
        eventos.add(feriado("Año Nuevo", "2027-01-01", "2027-01-01"));
        eventos.add(feriado("Jueves y Viernes Santo", "2027-03-25", "2027-03-26"));
        eventos.add(feriado("Día del Trabajo", "2027-05-01", "2027-05-01"));
        eventos.add(feriado("Día de la Bandera", "2027-06-07", "2027-06-07"));
        eventos.add(feriado("San Pedro y San Pablo", "2027-06-29", "2027-06-29"));
        eventos.add(feriado("Día de la Fuerza Aérea", "2027-07-23", "2027-07-23"));
        eventos.add(feriado("Fiestas Patrias", "2027-07-28", "2027-07-29"));
        eventos.add(feriado("Batalla de Junín", "2027-08-06", "2027-08-06"));
        eventos.add(feriado("Santa Rosa de Lima", "2027-08-30", "2027-08-30"));
        eventos.add(feriado("Combate de Angamos", "2027-10-08", "2027-10-08"));
        eventos.add(feriado("Día de Todos los Santos", "2027-11-01", "2027-11-01"));
        eventos.add(feriado("Inmaculada Concepción y Batalla de Ayacucho", "2027-12-08", "2027-12-09"));
        eventos.add(feriado("Navidad", "2027-12-25", "2027-12-25"));
        // Festividades y temporadas de Ica
        eventos.add(evento("Fin de año y Año Nuevo", TipoEvento.TEMPORADA_ALTA, "2026-12-30", "2027-01-02",
                "Alta demanda de turismo nacional."));
        eventos.add(evento("Temporada de verano (Huacachina)", TipoEvento.TEMPORADA_ALTA, "2027-01-15", "2027-03-04",
                "Mayor flujo de turistas por vacaciones escolares. " + VERIFICAR));
        eventos.add(evento("Festival Internacional de la Vendimia", TipoEvento.FESTIVIDAD_LOCAL, "2027-03-05", "2027-03-14",
                "El segundo viernes de marzo es día no laborable en Ica. " + VERIFICAR));
        eventos.add(evento("Semana Santa", TipoEvento.FESTIVIDAD_LOCAL, "2027-03-24", "2027-03-28",
                "Alta demanda en Ica y Paracas."));
        eventos.add(evento("Festividad del Señor de Luren", TipoEvento.FESTIVIDAD_LOCAL, "2027-10-15", "2027-10-18",
                "Procesión principal en octubre. " + VERIFICAR));
        repository.saveAll(eventos);
    }

    private static EventoCalendario feriado(String nombre, String inicio, String fin) {
        return evento(nombre, TipoEvento.FERIADO_NACIONAL, inicio, fin, "Feriado nacional.");
    }

    private static EventoCalendario evento(String nombre, TipoEvento tipo, String inicio, String fin, String descripcion) {
        return EventoCalendario.builder()
                .nombre(nombre).tipo(tipo)
                .fechaInicio(LocalDate.parse(inicio)).fechaFin(LocalDate.parse(fin))
                .descripcion(descripcion).activo(true).creadoPor("sistema")
                .build();
    }
}
