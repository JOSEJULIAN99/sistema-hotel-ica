package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.ReservaPublicaRequestDTO;
import com.Sistema.hoteleria.dto.ReservacionDTO;
import com.Sistema.hoteleria.dto.ReservacionRequestDTO;
import com.Sistema.hoteleria.model.entity.Huesped;
import com.Sistema.hoteleria.repository.HuespedRepository;
import com.Sistema.hoteleria.service.ReservacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Reserva desde la página pública: no requiere sesión y no expone la lista de huéspedes.
 * La reserva queda PENDIENTE hasta que recepción la confirme.
 */
@RestController
@RequestMapping("/api/publico")
@RequiredArgsConstructor
public class ReservaPublicaController {

    private final HuespedRepository huespedRepository;
    private final ReservacionService reservacionService;

    @PostMapping("/reservas")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> reservar(@Valid @RequestBody ReservaPublicaRequestDTO dto) {
        String documento = dto.getNumeroDocumento().trim();
        Huesped huesped = huespedRepository.findByNumeroDocumento(documento)
                .orElseGet(() -> huespedRepository.save(Huesped.builder()
                        .nombres(dto.getNombres().trim())
                        .apellidos(dto.getApellidos().trim())
                        .tipoDocumento(dto.getTipoDocumento())
                        .numeroDocumento(documento)
                        .telefono(dto.getTelefono())
                        .email(dto.getEmail())
                        .ciudadProcedencia(dto.getCiudadProcedencia())
                        .build()));

        ReservacionRequestDTO solicitud = ReservacionRequestDTO.builder()
                .huespedId(huesped.getId())
                .habitacionId(dto.getHabitacionId())
                .fechaEntrada(dto.getFechaEntrada())
                .fechaSalida(dto.getFechaSalida())
                .numeroPersonas(dto.getNumeroPersonas())
                .observaciones(dto.getObservaciones())
                .build();

        ReservacionDTO r = reservacionService.crearPendiente(solicitud);

        // Solo se devuelve lo necesario para el comprobante de la solicitud
        Map<String, Object> resumen = new LinkedHashMap<>();
        resumen.put("codigoReserva", r.getCodigoReserva());
        resumen.put("habitacion", r.getHabitacion() != null ? r.getHabitacion().getNumero() : null);
        resumen.put("fechaEntrada", r.getFechaEntrada());
        resumen.put("fechaSalida", r.getFechaSalida());
        resumen.put("precioTotal", r.getPrecioTotal());
        resumen.put("estado", r.getEstado());

        return new ResponseEntity<>(ApiResponse.ok(
                "Solicitud registrada. Recepción confirmará su reserva.", resumen), HttpStatus.CREATED);
    }
}
