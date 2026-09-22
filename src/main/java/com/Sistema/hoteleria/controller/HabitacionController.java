package com.Sistema.hoteleria.controller;

<<<<<<< HEAD
import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.HabitacionDTO;
import com.Sistema.hoteleria.dto.HabitacionRequestDTO;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import com.Sistema.hoteleria.service.HabitacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
=======
import com.Sistema.hoteleria.entity.Habitacion;
import com.Sistema.hoteleria.service.HabitacionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

>>>>>>> origin/frontend-VistaPersonal
import java.util.List;

@RestController
@RequestMapping("/api/habitaciones")
<<<<<<< HEAD
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HabitacionController {

    private final HabitacionService habitacionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HabitacionDTO>>> listar(
            @RequestParam(required = false) EstadoHabitacion estado,
            @RequestParam(required = false) TipoHabitacion tipo,
            @RequestParam(required = false) Integer piso,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        List<HabitacionDTO> resultado;
        if (checkIn != null && checkOut != null) {
            resultado = habitacionService.buscarDisponibles(checkIn, checkOut);
        } else if (estado != null) {
            resultado = habitacionService.filtrarPorEstado(estado);
        } else if (tipo != null) {
            resultado = habitacionService.filtrarPorTipo(tipo);
        } else if (piso != null) {
            resultado = habitacionService.filtrarPorPiso(piso);
        } else {
            resultado = habitacionService.obtenerTodas();
        }

        return ResponseEntity.ok(ApiResponse.ok("Listado de habitaciones obtenido", resultado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitacionDTO>> obtenerPorId(@PathVariable Long id) {
        HabitacionDTO hab = habitacionService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(hab));
    }

    @GetMapping("/numero/{numero}")
    public ResponseEntity<ApiResponse<HabitacionDTO>> obtenerPorNumero(@PathVariable String numero) {
        HabitacionDTO hab = habitacionService.obtenerPorNumero(numero);
        return ResponseEntity.ok(ApiResponse.ok(hab));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HabitacionDTO>> crear(@Valid @RequestBody HabitacionRequestDTO dto) {
        HabitacionDTO nueva = habitacionService.crear(dto);
        return new ResponseEntity<>(ApiResponse.ok("Habitación creada exitosamente", nueva), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitacionDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody HabitacionRequestDTO dto) {
        HabitacionDTO actualizada = habitacionService.actualizar(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Habitación actualizada exitosamente", actualizada));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<HabitacionDTO>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoHabitacion estado) {
        HabitacionDTO actualizada = habitacionService.cambiarEstado(id, estado);
        return ResponseEntity.ok(ApiResponse.ok("Estado de habitación actualizado", actualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        habitacionService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Habitación eliminada exitosamente", null));
    }
}
=======
public class HabitacionController {

    private final HabitacionService service;

    public HabitacionController(HabitacionService service) { this.service = service; }

    @GetMapping
    public List<Habitacion> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public Habitacion buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Habitacion crear(@RequestBody Habitacion habitacion) { return service.crear(habitacion); }

    @PutMapping("/{id}")
    public Habitacion actualizar(@PathVariable Long id, @RequestBody Habitacion habitacion) {
        return service.actualizar(id, habitacion);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) { service.eliminar(id); }
}
>>>>>>> origin/frontend-VistaPersonal
