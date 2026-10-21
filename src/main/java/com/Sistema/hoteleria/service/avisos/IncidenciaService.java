package com.Sistema.hoteleria.service.avisos;

import com.Sistema.hoteleria.dto.IncidenciaRequestDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.entity.Incidencia;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.EstadoIncidencia;
import com.Sistema.hoteleria.model.enums.TipoAviso;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.IncidenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/** Historial de incidencias de mantenimiento por habitación. */
@Service
@RequiredArgsConstructor
public class IncidenciaService {

    private static final List<EstadoIncidencia> ABIERTAS = List.of(EstadoIncidencia.ABIERTA, EstadoIncidencia.EN_ATENCION);

    private final IncidenciaRepository incidenciaRepository;
    private final HabitacionRepository habitacionRepository;
    private final AvisoService avisoService;

    @Transactional(readOnly = true)
    public List<Incidencia> listar(Long habitacionId) {
        return habitacionId != null
                ? incidenciaRepository.findByHabitacionIdOrderByFechaReporteDesc(habitacionId)
                : incidenciaRepository.findAllByOrderByFechaReporteDesc();
    }

    @Transactional
    public Incidencia reportar(IncidenciaRequestDTO dto, String usuario) {
        Habitacion h = habitacionRepository.findById(dto.getHabitacionId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitación", "id", dto.getHabitacionId()));
        boolean bloquea = Boolean.TRUE.equals(dto.getBloqueaHabitacion());
        Incidencia inc = incidenciaRepository.save(Incidencia.builder()
                .habitacion(h)
                .descripcion(dto.getDescripcion().trim())
                .prioridad(dto.getPrioridad())
                .bloqueaHabitacion(bloquea)
                .reportadoPor(usuario)
                .build());

        // Una incidencia grave saca la habitación de venta, salvo que haya un huésped dentro
        String detalle = "";
        if (bloquea && h.getEstado() != EstadoHabitacion.OCUPADA) {
            h.setEstado(EstadoHabitacion.MANTENIMIENTO);
            habitacionRepository.save(h);
            detalle = " La habitación pasó a MANTENIMIENTO.";
        }
        avisoService.enviar(TipoAviso.MANTENIMIENTO,
                "Incidencia en la habitación " + h.getNumero() + ": " + inc.getDescripcion() + "." + detalle,
                h.getNumero(), null, usuario);
        return inc;
    }

    @Transactional
    public Incidencia atender(Long id, String usuario) {
        Incidencia inc = buscar(id);
        if (inc.getEstado() != EstadoIncidencia.ABIERTA) {
            throw new BadRequestException("La incidencia ya está " + inc.getEstado());
        }
        inc.setEstado(EstadoIncidencia.EN_ATENCION);
        inc.setAtendidoPor(usuario);
        return incidenciaRepository.save(inc);
    }

    @Transactional
    public Incidencia resolver(Long id, String solucion, String usuario) {
        Incidencia inc = buscar(id);
        if (inc.getEstado() == EstadoIncidencia.RESUELTA) {
            throw new BadRequestException("La incidencia ya fue resuelta");
        }
        inc.setEstado(EstadoIncidencia.RESUELTA);
        inc.setSolucion(solucion);
        inc.setAtendidoPor(usuario);
        inc.setFechaResolucion(LocalDateTime.now());
        incidenciaRepository.saveAndFlush(inc);

        Habitacion h = inc.getHabitacion();
        long bloqueantes = incidenciaRepository.countByHabitacionIdAndBloqueaHabitacionTrueAndEstadoIn(h.getId(), ABIERTAS);
        if (h.getEstado() == EstadoHabitacion.MANTENIMIENTO && bloqueantes == 0) {
            h.setEstado(EstadoHabitacion.DISPONIBLE);
            habitacionRepository.save(h);
            avisoService.enviar(TipoAviso.HABITACION_LISTA,
                    "La habitación " + h.getNumero() + " volvió a estar disponible tras mantenimiento.",
                    h.getNumero(), null, usuario);
        }
        return inc;
    }

    private Incidencia buscar(Long id) {
        return incidenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia", "id", id));
    }
}
