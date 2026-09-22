package com.Sistema.hoteleria.service;

<<<<<<< HEAD
import com.Sistema.hoteleria.dto.HabitacionDTO;
import com.Sistema.hoteleria.dto.HabitacionRequestDTO;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;

import java.time.LocalDate;
import java.util.List;

public interface HabitacionService {
    List<HabitacionDTO> obtenerTodas();
    HabitacionDTO obtenerPorId(Long id);
    HabitacionDTO obtenerPorNumero(String numero);
    List<HabitacionDTO> filtrarPorEstado(EstadoHabitacion estado);
    List<HabitacionDTO> filtrarPorTipo(TipoHabitacion tipo);
    List<HabitacionDTO> filtrarPorPiso(Integer piso);
    List<HabitacionDTO> buscarDisponibles(LocalDate checkIn, LocalDate checkOut);
    HabitacionDTO crear(HabitacionRequestDTO dto);
    HabitacionDTO actualizar(Long id, HabitacionRequestDTO dto);
    HabitacionDTO cambiarEstado(Long id, EstadoHabitacion nuevoEstado);
    void eliminar(Long id);
}
=======
import com.Sistema.hoteleria.entity.Habitacion;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HabitacionService {

    private final HabitacionRepository repository;

    public HabitacionService(HabitacionRepository repository) {
        this.repository = repository;
    }

    public List<Habitacion> listar() { return repository.findAll(); }

    public Habitacion buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Habitacion no encontrada"));
    }

    public Habitacion crear(Habitacion habitacion) {
        repository.findByNumero(habitacion.getNumero()).ifPresent(existente -> {
            throw new IllegalArgumentException("El numero de habitacion ya existe");
        });
        return repository.save(habitacion);
    }

    public Habitacion actualizar(Long id, Habitacion datos) {
        Habitacion habitacion = buscar(id);
        habitacion.setNumero(datos.getNumero());
        habitacion.setTipo(datos.getTipo());
        habitacion.setCapacidad(datos.getCapacidad());
        habitacion.setPrecioNoche(datos.getPrecioNoche());
        habitacion.setDisponible(datos.isDisponible());
        return repository.save(habitacion);
    }

    public void eliminar(Long id) { repository.delete(buscar(id)); }
}
>>>>>>> origin/frontend-VistaPersonal
