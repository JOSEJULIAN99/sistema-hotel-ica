package com.Sistema.hoteleria.service.cliente;

import com.Sistema.hoteleria.dto.cliente.RegistroClienteDTO;
import com.Sistema.hoteleria.dto.cliente.SesionClienteDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Huesped;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.entity.Usuario;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.model.enums.TipoDocumento;
import com.Sistema.hoteleria.repository.HuespedRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.repository.UsuarioRepository;
import com.Sistema.hoteleria.security.JwtService;
import com.Sistema.hoteleria.service.ReservacionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClienteCuentaServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private HuespedRepository huespedRepository;
    @Mock private ReservacionRepository reservacionRepository;
    @Mock private ReservacionService reservacionService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @InjectMocks private ClienteCuentaService service;

    private RegistroClienteDTO registro(String apellidos) {
        return RegistroClienteDTO.builder()
                .nombres("Ana María").apellidos(apellidos)
                .tipoDocumento(TipoDocumento.DNI).numeroDocumento("45678912")
                .email("  Ana@Correo.com ").telefono("987654321")
                .password("clave2026")
                .build();
    }

    @Test
    @DisplayName("El registro crea la ficha de huésped y una cuenta CLIENTE con el correo como usuario")
    void registroCreaCuentaCliente() {
        when(huespedRepository.save(any(Huesped.class))).thenAnswer(i -> i.getArgument(0));
        when(passwordEncoder.encode("clave2026")).thenReturn("$2a$hash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtService.generarToken(any(Usuario.class))).thenReturn("token");

        SesionClienteDTO sesion = service.registrar(registro("Quispe Rojas"));

        ArgumentCaptor<Usuario> cuenta = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(cuenta.capture());
        assertThat(cuenta.getValue().getRol()).isEqualTo(RolUsuario.CLIENTE);
        assertThat(cuenta.getValue().getUsername()).isEqualTo("ana@correo.com");
        assertThat(cuenta.getValue().getHuesped().getNumeroDocumento()).isEqualTo("45678912");
        assertThat(sesion.getToken()).isEqualTo("token");
        assertThat(sesion.getCliente().getRol()).isEqualTo("CLIENTE");
    }

    @Test
    @DisplayName("Un documento que ya tiene cuenta no se puede registrar otra vez")
    void documentoConCuentaSeRechaza() {
        Huesped existente = Huesped.builder().id(5L).apellidos("Quispe Rojas").numeroDocumento("45678912").build();
        when(huespedRepository.findByNumeroDocumento("45678912")).thenReturn(Optional.of(existente));
        when(usuarioRepository.existsByHuespedId(5L)).thenReturn(true);

        assertThatThrownBy(() -> service.registrar(registro("Quispe Rojas")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ya tiene una cuenta");
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Si el documento ya existe con otros apellidos no se vincula la ficha")
    void apellidosDistintosSeRechazan() {
        Huesped existente = Huesped.builder().id(5L).apellidos("Mendoza").numeroDocumento("45678912").build();
        when(huespedRepository.findByNumeroDocumento("45678912")).thenReturn(Optional.of(existente));

        assertThatThrownBy(() -> service.registrar(registro("Quispe Rojas")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("no coinciden");
    }

    @Test
    @DisplayName("El ingreso de clientes rechaza las cuentas del personal")
    void loginClienteRechazaPersonal() {
        Usuario admin = Usuario.builder().username("admin").password("$2a$hash").rol(RolUsuario.ADMINISTRADOR).activo(true).build();
        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        assertThatThrownBy(() -> service.login("admin", "admin123"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("personal del hotel");
    }

    @Test
    @DisplayName("Un cliente no puede cancelar la reserva de otro cliente")
    void noCancelaReservaAjena() {
        Usuario cliente = Usuario.builder().username("ana@correo.com").rol(RolUsuario.CLIENTE)
                .huesped(Huesped.builder().id(1L).build()).build();
        Reservacion ajena = Reservacion.builder().id(9L).huesped(Huesped.builder().id(2L).build())
                .estado(EstadoReservacion.PENDIENTE).fechaEntrada(LocalDate.now().plusDays(5)).build();
        when(usuarioRepository.findByUsername("ana@correo.com")).thenReturn(Optional.of(cliente));
        when(reservacionRepository.findById(9L)).thenReturn(Optional.of(ajena));

        assertThatThrownBy(() -> service.cancelar("ana@correo.com", 9L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(reservacionService, never()).cancelar(any(), any());
    }
}
