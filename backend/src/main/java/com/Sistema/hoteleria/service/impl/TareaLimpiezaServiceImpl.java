package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.TareaLimpiezaDTO;
import com.Sistema.hoteleria.dto.TareaLimpiezaRequestDTO;
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

        // Si la habitación no estaba ya en limpieza, la marcamos como LIMPIEZA
        if (h.getEstado() != EstadoHabitacion.OCUPADA) {
            h.setEstado(EstadoHabitacion.LIMPIEZA);
            habitacionRepository.save(h);
        }

        return EntityMapper.toTareaLimpiezaDTO(tareaLimpiezaRepository.save(tarea));
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

        tarea.setEstado(EstadoLimpieza.EN_PROCESO);
        tarea.setFechaInicio(LocalDateTime.now());

        Habitacion h = tarea.getHabitacion();
        if (h.getEstado() != EstadoHabitacion.OCUPADA) {
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

        tarea.setEstado(EstadoLimpieza.COMPLETADA);
        tarea.setFechaFin(LocalDateTime.now());
        tareaLimpiezaRepository.save(tarea);

        // Cuando la limpieza se completa, la habitación pasa automáticamente a DISPONIBLE (salvo que esté ocupada por estadía activa)
        Habitacion h = tarea.getHabitacion();
        if (h.getEstado() == EstadoHabitacion.LIMPIEZA) {
            h.setEstado(EstadoHabitacion.DISPONIBLE);
            habitacionRepository.save(h);
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
