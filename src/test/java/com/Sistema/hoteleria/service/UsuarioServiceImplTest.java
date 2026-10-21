package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.UsuarioRequestDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.model.entity.Usuario;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.repository.UsuarioRepository;
import com.Sistema.hoteleria.security.JwtService;
import com.Sistema.hoteleria.service.impl.UsuarioServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @InjectMocks private UsuarioServiceImpl service;

    @Test
    @DisplayName("El ingreso del personal rechaza las cuentas de clientes")
    void loginPersonalRechazaCliente() {
        Usuario cliente = Usuario.builder().username("ana@correo.com").password("$2a$hash")
                .rol(RolUsuario.CLIENTE).activo(true).build();
        when(usuarioRepository.findByUsername("ana@correo.com")).thenReturn(Optional.of(cliente));
        when(passwordEncoder.matches("clave", "$2a$hash")).thenReturn(true);

        assertThatThrownBy(() -> service.login("ana@correo.com", "clave"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cuenta es de cliente");
        verify(jwtService, never()).generarToken(any());
    }

    @Test
    @DisplayName("Desde el panel no se pueden crear cuentas de clientes")
    void crearRechazaRolCliente() {
        UsuarioRequestDTO dto = UsuarioRequestDTO.builder().username("nuevo").password("clave-segura")
                .nombreCompleto("Nuevo").rol(RolUsuario.CLIENTE).build();

        assertThatThrownBy(() -> service.crear(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("solo se registra al personal");
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("No se puede desactivar al último administrador activo")
    void protegeUltimoAdministrador() {
        Usuario admin = Usuario.builder().id(1L).username("admin").rol(RolUsuario.ADMINISTRADOR).activo(true).build();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(usuarioRepository.countByRolAndActivoTrue(RolUsuario.ADMINISTRADOR)).thenReturn(1L);

        assertThatThrownBy(() -> service.cambiarActivo(1L, false, "otro-admin"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("al menos un administrador");
    }

    @Test
    @DisplayName("Un usuario no puede desactivar su propia cuenta")
    void noSeDesactivaASiMismo() {
        Usuario pablo = Usuario.builder().id(2L).username("pluna").rol(RolUsuario.RECEPCIONISTA).activo(true).build();
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(pablo));

        assertThatThrownBy(() -> service.desactivar(2L, "pluna"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("propia cuenta");
    }
}
