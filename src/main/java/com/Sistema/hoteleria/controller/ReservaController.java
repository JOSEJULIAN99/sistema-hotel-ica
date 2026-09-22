package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.entity.Reserva;
import com.Sistema.hoteleria.service.ReservaService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService service;

    public ReservaController(ReservaService service) { this.service = service; }

    @GetMapping
    public List<Reserva> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public Reserva buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Reserva crear(@RequestBody CrearReservaRequest request) {
        Reserva reserva = new Reserva();
        reserva.setHuesped(request.huesped());
        reserva.setDocumento(request.documento());
        reserva.setFechaEntrada(request.fechaEntrada());
        reserva.setFechaSalida(request.fechaSalida());
        return service.crear(reserva, request.habitacionId());
    }

    @PostMapping("/{id}/cancelar")
    public Reserva cancelar(@PathVariable Long id) { return service.cancelar(id); }

    public record CrearReservaRequest(String huesped, String documento,
                                      java.time.LocalDate fechaEntrada,
                                      java.time.LocalDate fechaSalida,
                                      Long habitacionId) { }
}