package com.Sistema.hoteleria.service.tarifas;

import com.Sistema.hoteleria.model.entity.TarifaTemporada;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CalculadoraTarifaTest {

    private static TarifaTemporada tarifa(String inicio, String fin, int pct, TipoHabitacion tipo, boolean activa) {
        return TarifaTemporada.builder().nombre("t").fechaInicio(LocalDate.parse(inicio)).fechaFin(LocalDate.parse(fin))
                .porcentaje(pct).tipoHabitacion(tipo).activa(activa).build();
    }

    @Test
    @DisplayName("Sin tarifas de temporada, el total es noches x tarifa base")
    void sinTarifas() {
        BigDecimal total = CalculadoraTarifa.total(new BigDecimal("140.00"), TipoHabitacion.DOBLE,
                LocalDate.parse("2027-03-10"), LocalDate.parse("2027-03-13"), List.of());
        assertThat(total).isEqualByComparingTo("420.00");
    }

    @Test
    @DisplayName("Solo las noches cubiertas suben, y gana el mayor porcentaje")
    void aplicaPorNoche() {
        List<TarifaTemporada> tarifas = List.of(
                tarifa("2027-03-12", "2027-03-14", 30, null, true),
                tarifa("2027-03-12", "2027-03-12", 40, TipoHabitacion.DOBLE, true),
                tarifa("2027-03-11", "2027-03-11", 90, null, false));
        // 11: base 100 (la de 90 % está inactiva) · 12: +40 % = 140 · 13: +30 % = 130
        BigDecimal total = CalculadoraTarifa.total(new BigDecimal("100.00"), TipoHabitacion.DOBLE,
                LocalDate.parse("2027-03-11"), LocalDate.parse("2027-03-14"), tarifas);
        assertThat(total).isEqualByComparingTo("370.00");
    }

    @Test
    @DisplayName("Una tarifa de otro tipo de habitación no aplica")
    void respetaTipo() {
        List<TarifaTemporada> tarifas = List.of(tarifa("2027-03-12", "2027-03-12", 50, TipoHabitacion.SUITE, true));
        assertThat(CalculadoraTarifa.porcentajeNoche(LocalDate.parse("2027-03-12"), TipoHabitacion.DOBLE, tarifas)).isZero();
    }
}
