package com.Sistema.hoteleria.security;

import com.Sistema.hoteleria.model.entity.Usuario;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRETO = "clave-de-pruebas-hotel-princes-ica-de-32-caracteres";

    private final JwtService jwt = new JwtService(SECRETO, 60);

    private Usuario admin() {
        return Usuario.builder().id(1L).username("admin").rol(RolUsuario.ADMINISTRADOR).build();
    }

    @Test
    @DisplayName("El token generado lleva el usuario y su rol")
    void generaYValida() {
        Optional<Claims> claims = jwt.validar(jwt.generarToken(admin()));

        assertThat(claims).isPresent();
        assertThat(claims.get().getSubject()).isEqualTo("admin");
        assertThat(claims.get().get("rol", String.class)).isEqualTo("ADMINISTRADOR");
    }

    @Test
    @DisplayName("Un token alterado no es válido")
    void rechazaTokenAlterado() {
        String token = jwt.generarToken(admin());
        String alterado = token.substring(0, token.length() - 3) + "abc";

        assertThat(jwt.validar(alterado)).isEmpty();
        assertThat(jwt.validar("no-es-un-token")).isEmpty();
    }

    @Test
    @DisplayName("Un token firmado con otra clave no es válido")
    void rechazaOtraClave() {
        JwtService otro = new JwtService("otra-clave-distinta-para-firmar-tokens-123", 60);

        assertThat(jwt.validar(otro.generarToken(admin()))).isEmpty();
    }

    @Test
    @DisplayName("La clave debe tener al menos 32 caracteres")
    void exigeClaveLarga() {
        assertThatThrownBy(() -> new JwtService("corta", 60)).isInstanceOf(IllegalStateException.class);
    }
}
