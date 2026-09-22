package com.Sistema.hoteleria.service.impl;

import com.Sistema.hoteleria.dto.HabitacionDTO;
import com.Sistema.hoteleria.dto.HabitacionRequestDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.service.HabitacionService;
import com.Sistema.hoteleria.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitacionServiceImpl implements HabitacionService {

    private final HabitacionRepository habitacionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HabitacionDTO> obtenerTodas() {
        return habitacionRepository.findAll().stream()
                .map(EntityMapper::toHabitacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HabitacionDTO obtenerPorId(Long id) {
        Habitacion h = habitacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación", "id", id));
        return EntityMapper.toHabitacionDTO(h);
    }

    @Override
    @Transactional(readOnly = true)
    public HabitacionDTO obtenerPorNumero(String numero) {
        Habitacion h = habitacionRepository.findByNumero(numero)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación", "número", numero));
        return EntityMapper.toHabitacionDTO(h);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitacionDTO> filtrarPorEstado(EstadoHabitacion estado) {
        return habitacionRepository.findByEstado(estado).stream()
                .map(EntityMapper::toHabitacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitacionDTO> filtrarPorTipo(TipoHabitacion tipo) {
        return habitacionRepository.findByTipo(tipo).stream()
                .map(EntityMapper::toHabitacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitacionDTO> filtrarPorPiso(Integer piso) {
        return habitacionRepository.findByPiso(piso).stream()
                .map(EntityMapper::toHabitacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitacionDTO> buscarDisponibles(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            return filtrarPorEstado(EstadoHabitacion.DISPONIBLE);
        }
        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new BadRequestException("La fecha de salida debe ser posterior a la fecha de entrada");
        }
        return habitacionRepository.findHabitacionesDisponiblesPorFechas(checkIn, checkOut).stream()
                .map(EntityMapper::toHabitacionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HabitacionDTO crear(HabitacionRequestDTO dto) {
        if (habitacionRepository.existsByNumero(dto.getNumero())) {
            throw new BadRequestException("Ya existe una habitación con el número: " + dto.getNumero());
        }
        Habitacion h = Habitacion.builder()
                .numero(dto.getNumero())
                .piso(dto.getPiso())
                .tipo(dto.getTipo())
                .precioPorNoche(dto.getPrecioPorNoche())
                .capacidad(dto.getCapacidad())
                .estado(dto.getEstado() != null ? dto.getEstado() : EstadoHabitacion.DISPONIBLE)
                .descripcion(dto.getDescripcion())
                .caracteristicas(dto.getCaracteristicas())
                .imagenUrl(dto.getImagenUrl())
                .build();
        return EntityMapper.toHabitacionDTO(habitacionRepository.save(h));
    }

    @Override
    @Transactional
    public HabitacionDTO actualizar(Long id, HabitacionRequestDTO dto) {
        Habitacion h = habitacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación", "id", id));

        if (!h.getNumero().equalsIgnoreCase(dto.getNumero()) && habitacionRepository.existsByNumero(dto.getNumero())) {
            throw new BadRequestException("Ya existe otra habitación con el número: " + dto.getNumero());
        }

        h.setNumero(dto.getNumero());
        h.setPiso(dto.getPiso());
        h.setTipo(dto.getTipo());
        h.setPrecioPorNoche(dto.getPrecioPorNoche());
        h.setCapacidad(dto.getCapacidad());
        if (dto.getEstado() != null) {
            h.setEstado(dto.getEstado());
        }
        h.setDescripcion(dto.getDescripcion());
        h.setCaracteristicas(dto.getCaracteristicas());
        h.setImagenUrl(dto.getImagenUrl());

        return EntityMapper.toHabitacionDTO(habitacionRepository.save(h));
    }

    @Override
    @Transactional
    public HabitacionDTO cambiarEstado(Long id, EstadoHabitacion nuevoEstado) {
        Habitacion h = habitacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habitación", "id", id));
        h.setEstado(nuevoEstado);
        return EntityMapper.toHabitacionDTO(habitacionRepository.save(h));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!habitacionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Habitación", "id", id);
        }
        habitacionRepository.deleteById(id);
    }
}
