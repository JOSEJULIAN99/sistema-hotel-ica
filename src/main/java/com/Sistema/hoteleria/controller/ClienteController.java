package com.Sistema.hoteleria.controller;

import com.Sistema.hoteleria.dto.ApiResponse;
import com.Sistema.hoteleria.dto.ReservacionDTO;
import com.Sistema.hoteleria.dto.cliente.ActualizarPerfilDTO;
import com.Sistema.hoteleria.dto.cliente.LoginClienteDTO;
import com.Sistema.hoteleria.dto.cliente.PerfilClienteDTO;
import com.Sistema.hoteleria.dto.cliente.RegistroClienteDTO;
import com.Sistema.hoteleria.dto.cliente.ReservaClienteDTO;
import com.Sistema.hoteleria.dto.cliente.SesionClienteDTO;
import com.Sistema.hoteleria.security.LimitadorSolicitudes;
import com.Sistema.hoteleria.service.cliente.ClienteCuentaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Portal del cliente: registro, ingreso, perfil y reservas propias.
 * El registro y el ingreso son públicos; lo demás exige un token con rol CLIENTE.
 */
@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
public class ClienteController {

    private static final int INTENTOS_POR_MINUTO = 10;

    private final ClienteCuentaService clienteCuentaService;
    private final LimitadorSolicitudes limitador;

    @PostMapping("/registro")
    public ResponseEntity<ApiResponse<SesionClienteDTO>> registrar(@Valid @RequestBody RegistroClienteDTO dto,
                                                                   HttpServletRequest request) {
        limitador.verificar("cliente-registro:" + request.getRemoteAddr(), INTENTOS_POR_MINUTO);
        return new ResponseEntity<>(ApiResponse.ok("Cuenta creada. ¡Bienvenido/a!",
                clienteCuentaService.registrar(dto)), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<SesionClienteDTO>> login(@Valid @RequestBody LoginClienteDTO dto,
                                                               HttpServletRequest request) {
        limitador.verificar("cliente-login:" + request.getRemoteAddr(), INTENTOS_POR_MINUTO);
        return ResponseEntity.ok(ApiResponse.ok("Inicio de sesión exitoso",
                clienteCuentaService.login(dto.getEmail(), dto.getPassword())));
    }

    @GetMapping("/perfil")
    public ResponseEntity<ApiResponse<PerfilClienteDTO>> perfil(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(clienteCuentaService.perfil(auth.getName())));
    }

    @PutMapping("/perfil")
    public ResponseEntity<ApiResponse<PerfilClienteDTO>> actualizarPerfil(Authentication auth,
                                                                          @RequestBody ActualizarPerfilDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Datos actualizados",
                clienteCuentaService.actualizarPerfil(auth.getName(), dto)));
    }

    @GetMapping("/reservas")
    public ResponseEntity<ApiResponse<List<ReservacionDTO>>> misReservas(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(clienteCuentaService.misReservas(auth.getName())));
    }

    @PostMapping("/reservas")
    public ResponseEntity<ApiResponse<ReservacionDTO>> reservar(Authentication auth,
                                                                @Valid @RequestBody ReservaClienteDTO dto) {
        return new ResponseEntity<>(ApiResponse.ok("Reserva registrada. Recepción la confirmará o puede pagarla en línea.",
                clienteCuentaService.reservar(auth.getName(), dto)), HttpStatus.CREATED);
    }

    @PatchMapping("/reservas/{id}/cancelar")
    public ResponseEntity<ApiResponse<ReservacionDTO>> cancelar(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Reserva cancelada",
                clienteCuentaService.cancelar(auth.getName(), id)));
    }
}
