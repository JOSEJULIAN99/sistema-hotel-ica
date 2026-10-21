package com.Sistema.hoteleria.util;

import com.Sistema.hoteleria.exception.DatosInvalidosException;
import com.Sistema.hoteleria.model.enums.TipoDocumento;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ValidadorDatosTest {

    @Test
    @DisplayName("Valida el documento según su tipo")
    void documentoSegunTipo() {
        assertThat(ValidadorDatos.documento(TipoDocumento.DNI, "45678912")).isNull();
        assertThat(ValidadorDatos.documento(TipoDocumento.DNI, "4567891")).contains("8 dígitos");
        assertThat(ValidadorDatos.documento(TipoDocumento.PASAPORTE, "ab123456")).isNull();
        assertThat(ValidadorDatos.documento(TipoDocumento.RUC, "20123456789")).isNull();
        assertThat(ValidadorDatos.documento(TipoDocumento.RUC, "30123456789")).isNotNull();
    }

    @Test
    @DisplayName("Acepta celular peruano o internacional; rechaza otros formatos")
    void telefono() {
        assertThat(ValidadorDatos.telefono("987 654 321")).isNull();
        assertThat(ValidadorDatos.telefono("+34612345678")).isNull();
        assertThat(ValidadorDatos.telefono("12345")).isNotNull();
        assertThat(ValidadorDatos.telefono("")).isNull();
    }

    @Test
    @DisplayName("Nombres solo con letras y la contraseña con letras y números")
    void nombreYPassword() {
        assertThat(ValidadorDatos.nombre("María José", "nombres")).isNull();
        assertThat(ValidadorDatos.nombre("Juan123", "nombres")).isNotNull();
        assertThat(ValidadorDatos.password("solo-letras")).contains("letras y números");
        assertThat(ValidadorDatos.password("clave2026")).isNull();
    }

    @Test
    @DisplayName("Una reserva web no admite fechas pasadas ni más de 30 noches, y devuelve el error de cada campo")
    void estanciaWeb() {
        LocalDate base = LocalDate.now().plusDays(5);
        assertThatThrownBy(() -> ValidadorDatos.estanciaWeb(LocalDate.now().minusDays(3), base, 2, null))
                .isInstanceOfSatisfying(DatosInvalidosException.class,
                        e -> assertThat(e.getErrores()).containsKey("fechaEntrada"));
        assertThatThrownBy(() -> ValidadorDatos.estanciaWeb(base, base.plusDays(31), 2, null))
                .isInstanceOfSatisfying(DatosInvalidosException.class,
                        e -> assertThat(e.getErrores()).containsKey("fechaSalida"));
        ValidadorDatos.estanciaWeb(base, base.plusDays(2), 2, "Llegaré de noche");
    }
}
