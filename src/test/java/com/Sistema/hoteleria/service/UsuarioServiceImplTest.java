package com.Sistema.hoteleria.service;

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
}
