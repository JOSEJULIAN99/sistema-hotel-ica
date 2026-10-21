package com.Sistema.hoteleria.service.tarifas;

import com.Sistema.hoteleria.model.entity.TarifaTemporada;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/** Precio de una estancia noche por noche, aplicando la tarifa de temporada aprobada de cada noche. */
public final class CalculadoraTarifa {

    private static final BigDecimal CIEN = BigDecimal.valueOf(100);

    private CalculadoraTarifa() { }

    /** % que aplica a una noche: el mayor de las tarifas activas que la cubren (0 si ninguna). */
    public static int porcentajeNoche(LocalDate noche, TipoHabitacion tipo, List<TarifaTemporada> tarifas) {
        return tarifas.stream()
                .filter(t -> t.aplica(noche, tipo))
                .mapToInt(TarifaTemporada::getPorcentaje)
                .max()
                .orElse(0);
    }

    /** Total de las noches [entrada, salida): cada noche = base × (100 + %) / 100. */
    public static BigDecimal total(BigDecimal precioBase, TipoHabitacion tipo, LocalDate entrada, LocalDate salida,
                                   List<TarifaTemporada> tarifas) {
        BigDecimal total = BigDecimal.ZERO;
        for (LocalDate noche = entrada; noche.isBefore(salida); noche = noche.plusDays(1)) {
            int pct = porcentajeNoche(noche, tipo, tarifas);
            BigDecimal precioNoche = precioBase.multiply(CIEN.add(BigDecimal.valueOf(pct)))
                    .divide(CIEN, 2, RoundingMode.HALF_UP);
            total = total.add(precioNoche);
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }
}
