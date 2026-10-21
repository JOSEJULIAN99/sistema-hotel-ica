package com.Sistema.hoteleria.service.publico;

import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.repository.TarifaTemporadaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisponibilidadServiceTest {

    @Mock private HabitacionRepository habitacionRepository;
    @Mock private ReservacionRepository reservacionRepository;
    @Mock private EstadiaRepository estadiaRepository;
    @Mock private TarifaTemporadaRepository tarifaRepository;

    @InjectMocks private DisponibilidadService service;

    private static Habitacion hab(long id, String numero, EstadoHabitacion estado) {
        return Habitacion.builder().id(id).numero(numero).tipo(TipoHabitacion.DOBLE)
                .precioPorNoche(new BigDecimal("140.00")).capacidad(2).estado(estado).build();
    }

    @Test
    @DisplayName("Marca libre, ocupada por fechas y en mantenimiento, con el total de las noches")
    void clasificaHabitaciones() {
        LocalDate entrada = LocalDate.now().plusDays(10);
        LocalDate salida = entrada.plusDays(2);
        when(tarifaRepository.findActivasEnRango(entrada, salida)).thenReturn(List.of());
        when(habitacionRepository.findAll()).thenReturn(List.of(
                hab(1, "101", EstadoHabitacion.DISPONIBLE),
                hab(2, "102", EstadoHabitacion.DISPONIBLE),
                hab(3, "103", EstadoHabitacion.MANTENIMIENTO)));
        when(reservacionRepository.contarReservasSolapadas(1L, entrada, salida)).thenReturn(0L);
        when(reservacionRepository.contarReservasSolapadas(2L, entrada, salida)).thenReturn(1L);

        List<Map<String, Object>> r = service.consultar(entrada, salida, 2);

        assertThat(r).extracting(f -> f.get("disponible")).containsExactly(true, false, false);
        assertThat(r.get(1).get("motivo")).isEqualTo("Ocupada en esas fechas");
        assertThat(r.get(2).get("motivo")).isEqualTo("En mantenimiento");
        assertThat(r.get(0).get("total")).isEqualTo(new BigDecimal("280.00"));
    }

    @Test
    @DisplayName("No acepta fechas pasadas ni estancias de más de 30 noches")
    void validaFechas() {
        LocalDate hoy = LocalDate.now();
        assertThatThrownBy(() -> service.consultar(hoy.minusDays(3), hoy.plusDays(1), 1))
                .isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> service.consultar(hoy.plusDays(1), hoy.plusDays(40), 1))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("30 noches");
    }
}
