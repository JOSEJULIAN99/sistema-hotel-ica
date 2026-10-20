package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.TareaLimpiezaDTO;
import com.Sistema.hoteleria.dto.TareaLimpiezaRequestDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.entity.TareaLimpieza;
import com.Sistema.hoteleria.model.entity.Usuario;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.EstadoLimpieza;
import com.Sistema.hoteleria.model.enums.PrioridadLimpieza;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.TareaLimpiezaRepository;
import com.Sistema.hoteleria.repository.UsuarioRepository;
import com.Sistema.hoteleria.service.TareaLimpiezaService;
import com.Sistema.hoteleria.service.avisos.AvisoService;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.model.enums.TipoAviso;
import com.Sistema.hoteleria.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TareaLimpiezaServiceImpl implements TareaLimpiezaService {

    private final TareaLimpiezaRepository tareaLimpiezaRepository;
    private final HabitacionRepository habitacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final AvisoService avisoService;

    @Override
    @Transactional(readOnly = true)
    public List<TareaLimpiezaDTO> obtenerTodas() {
        return tareaLimpiezaRepository.findAll().stream()
                .map(EntityMapper::toTareaLimpiezaDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TareaLimpiezaDTO> obtenerPendientes() {
        return tareaLimpiezaRepository.findTareasPendientesYEnProceso().stream()
                .map(EntityMapper::toTareaLimpiezaDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TareaLimpiezaDTO> obtenerPorEmpleado(Long empleadoId) {
        return tareaLimpiezaRepository.findByEmpleadoAsignadoId(empleadoId).stream()
                .map(EntityMapper::toTareaLimpiezaDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TareaLimpiezaDTO obtenerPorId(Long id) {
        TareaLimpieza t = tareaLimpiezaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea de Limpieza", "id", id));
        return EntityMapper.toTareaLimpiezaDTO(t);
    }

    @Override
    @Transactional
    public TareaLimpiezaDTO crear(TareaLimpiezaRequestDTO dto) {
        Habitacion h = habitacionRepository.findById(dto.getHabitacionId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitación", "id", dto.getHabitacionId()));

        Usuario empleado = null;
        if (dto.getEmpleadoId() != null) {
            empleado = usuarioRepository.findById(dto.getEmpleadoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Empleado", "id", dto.getEmpleadoId()));
        }

        TareaLimpieza tarea = TareaLimpieza.builder()
                .habitacion(h)
                .empleadoAsignado(empleado)
                .tipoLimpieza(dto.getTipoLimpieza() != null ? dto.getTipoLimpieza() : "RUTINARIA")
                .estado(EstadoLimpieza.PENDIENTE)
                .prioridad(dto.getPrioridad() != null ? dto.getPrioridad() : PrioridadLimpieza.MEDIA)
                .observaciones(dto.getObservaciones())
                .fechaCreacion(LocalDateTime.now())
                .build();

        // Solo una habitación libre pasa a LIMPIEZA; no se pisan OCUPADA, RESERVADA ni MANTENIMIENTO
        if (h.getEstado() == EstadoHabitacion.DISPONIBLE) {
            h.setEstado(EstadoHabitacion.LIMPIEZA);
            habitacionRepository.save(h);
        }

        TareaLimpiezaDTO creada = EntityMapper.toTareaLimpiezaDTO(tareaLimpiezaRepository.save(tarea));
        if (tarea.getPrioridad() == PrioridadLimpieza.ALTA || tarea.getPrioridad() == PrioridadLimpieza.URGENTE) {
            avisoService.enviar(TipoAviso.LIMPIEZA_URGENTE,
                    "Limpieza " + tarea.getPrioridad() + " en la habitación " + h.getNumero()
                            + (tarea.getObservaciones() != null ? ": " + tarea.getObservaciones() : "."),
                    h.getNumero(), RolUsuario.LIMPIEZA, "recepción");
        }
        return creada;
    }

    @Override
    @Transactional
    public TareaLimpiezaDTO asignarEmpleado(Long tareaId, Long empleadoId) {
        TareaLimpieza tarea = tareaLimpiezaRepository.findById(tareaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea de Limpieza", "id", tareaId));

        Usuario empleado = usuarioRepository.findById(empleadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", "id", empleadoId));

        tarea.setEmpleadoAsignado(empleado);
        return EntityMapper.toTareaLimpiezaDTO(tareaLimpiezaRepository.save(tarea));
    }

    @Override
    @Transactional
    public TareaLimpiezaDTO iniciarLimpieza(Long tareaId) {
        TareaLimpieza tarea = tareaLimpiezaRepository.findById(tareaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea de Limpieza", "id", tareaId));

        if (tarea.getEstado() != EstadoLimpieza.PENDIENTE) {
            throw new BadRequestException("Solo se puede iniciar una tarea PENDIENTE. Estado actual: " + tarea.getEstado());
        }
        tarea.setEstado(EstadoLimpieza.EN_PROCESO);
        tarea.setFechaInicio(LocalDateTime.now());

        Habitacion h = tarea.getHabitacion();
        if (h.getEstado() == EstadoHabitacion.DISPONIBLE) {
            h.setEstado(EstadoHabitacion.LIMPIEZA);
            habitacionRepository.save(h);
        }

        return EntityMapper.toTareaLimpiezaDTO(tareaLimpiezaRepository.save(tarea));
    }

    @Override
    @Transactional
    public TareaLimpiezaDTO completarLimpieza(Long tareaId) {
        TareaLimpieza tarea = tareaLimpiezaRepository.findById(tareaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea de Limpieza", "id", tareaId));

        if (tarea.getEstado() != EstadoLimpieza.PENDIENTE && tarea.getEstado() != EstadoLimpieza.EN_PROCESO) {
            throw new BadRequestException("La tarea ya está " + tarea.getEstado());
        }
        tarea.setEstado(EstadoLimpieza.COMPLETADA);
        tarea.setFechaFin(LocalDateTime.now());
        tareaLimpiezaRepository.saveAndFlush(tarea);

        // La habitación queda DISPONIBLE solo si estaba en LIMPIEZA y no le quedan otras tareas abiertas
        Habitacion h = tarea.getHabitacion();
        long abiertas = tareaLimpiezaRepository.countByHabitacionIdAndEstadoIn(
                h.getId(), List.of(EstadoLimpieza.PENDIENTE, EstadoLimpieza.EN_PROCESO));
        if (h.getEstado() == EstadoHabitacion.LIMPIEZA && abiertas == 0) {
            h.setEstado(EstadoHabitacion.DISPONIBLE);
            habitacionRepository.save(h);
            avisoService.enviar(TipoAviso.HABITACION_LISTA,
                    "Habitación " + h.getNumero() + " limpia y disponible para check-in.",
                    h.getNumero(), RolUsuario.RECEPCIONISTA, "sistema");
        }

        return EntityMapper.toTareaLimpiezaDTO(tarea);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!tareaLimpiezaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tarea de Limpieza", "id", id);
        }
        tareaLimpiezaRepository.deleteById(id);
    }
}
