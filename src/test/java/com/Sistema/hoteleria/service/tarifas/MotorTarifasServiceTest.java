package com.Sistema.hoteleria.service.tarifas;

import com.Sistema.hoteleria.model.entity.EventoCalendario;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.entity.RecomendacionTarifa;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.EstadoRecomendacion;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.model.enums.TipoEvento;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.EventoCalendarioRepository;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.RecomendacionTarifaRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.repository.TarifaTemporadaRepository;
import com.Sistema.hoteleria.service.ConfiguracionService;
import com.Sistema.hoteleria.service.ConfiguracionService.ReglasTarifa;
import com.Sistema.hoteleria.service.ia.ClienteModeloIA;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MotorTarifasServiceTest {

    private static final ReglasTarifa REGLAS = new ReglasTarifa(75, 15, 20, 30, 15, 10, 40, 60);

    @Mock private ConfiguracionService configuracionService;
    @Mock private EventoCalendarioRepository eventoRepository;
    @Mock private RecomendacionTarifaRepository recomendacionRepository;
    @Mock private TarifaTemporadaRepository tarifaRepository;
    @Mock private ReservacionRepository reservacionRepository;
    @Mock private EstadiaRepository estadiaRepository;
    @Mock private HabitacionRepository habitacionRepository;
    @Mock private ClienteModeloIA clienteIA;

    @InjectMocks private MotorTarifasService motor;

    private static List<Habitacion> habitaciones(int n) {
        return IntStream.range(0, n).mapToObj(i -> Habitacion.builder().id((long) i).estado(EstadoHabitacion.DISPONIBLE).build()).toList();
    }

    private static Reservacion reserva(long habitacionId, String entrada, String salida) {
        return Reservacion.builder().habitacion(Habitacion.builder().id(habitacionId).build())
                .fechaEntrada(LocalDate.parse(entrada)).fechaSalida(LocalDate.parse(salida))
                .estado(EstadoReservacion.CONFIRMADA).build();
    }

    @Test
    @DisplayName("Festividad + ocupación alta suman, pero respetan el tope de +40 %")
    void festividadConOcupacionAltaRespetaTope() {
        LocalDate dia = LocalDate.parse("2027-03-12");
        when(habitacionRepository.findAll()).thenReturn(habitaciones(4));
        when(eventoRepository.findActivosEnRango(dia, dia)).thenReturn(List.of(EventoCalendario.builder()
                .nombre("Vendimia").tipo(TipoEvento.FESTIVIDAD_LOCAL).activo(true).fechaInicio(dia).fechaFin(dia).build()));
        // 3 de 4 habitaciones reservadas = 75 % (alcanza el umbral)
        when(reservacionRepository.findAll()).thenReturn(List.of(
                reserva(1, "2027-03-11", "2027-03-13"), reserva(2, "2027-03-12", "2027-03-14"), reserva(3, "2027-03-12", "2027-03-13")));

        List<MotorTarifasService.Noche> noches = motor.evaluarNoches(dia, dia, REGLAS);

        assertThat(noches).hasSize(1);
        assertThat(noches.get(0).ocupacion()).isEqualTo(75.0);
        assertThat(noches.get(0).porcentaje()).isEqualTo(40); // 30 + 15 = 45 → tope 40
    }

    @Test
    @DisplayName("Agrupa noches seguidas con el mismo ajuste y omite las de 0 %")
    void agrupaNoches() {
        List<MotorTarifasService.Noche> noches = List.of(
                new MotorTarifasService.Noche(LocalDate.parse("2027-07-27"), 0, 10, List.of(), List.of()),
                new MotorTarifasService.Noche(LocalDate.parse("2027-07-28"), 20, 10, List.of("Fiestas Patrias"), List.of()),
                new MotorTarifasService.Noche(LocalDate.parse("2027-07-29"), 20, 10, List.of("Fiestas Patrias"), List.of()),
                new MotorTarifasService.Noche(LocalDate.parse("2027-07-30"), 15, 80, List.of(), List.of()));

        List<List<MotorTarifasService.Noche>> grupos = MotorTarifasService.agrupar(noches);

        assertThat(grupos).hasSize(2);
        assertThat(grupos.get(0)).hasSize(2);
        assertThat(grupos.get(1).get(0).porcentaje()).isEqualTo(15);
    }

    @Test
    @DisplayName("Crea la recomendación PENDIENTE con justificación por reglas si no hay IA")
    void creaRecomendacionPendiente() {
        LocalDate dia = LocalDate.parse("2027-07-28");
        when(configuracionService.reglasTarifa()).thenReturn(REGLAS);
        when(habitacionRepository.findAll()).thenReturn(habitaciones(10));
        when(eventoRepository.findActivosEnRango(dia, dia)).thenReturn(List.of(EventoCalendario.builder()
                .nombre("Fiestas Patrias").tipo(TipoEvento.FERIADO_NACIONAL).activo(true).fechaInicio(dia).fechaFin(dia).build()));
        when(clienteIA.completar(anyString(), anyString())).thenReturn(Optional.empty());
        when(recomendacionRepository.save(any(RecomendacionTarifa.class))).thenAnswer(inv -> inv.getArgument(0));

        List<RecomendacionTarifa> nuevas = motor.analizar(dia, dia, "admin");

        assertThat(nuevas).hasSize(1);
        RecomendacionTarifa r = nuevas.get(0);
        assertThat(r.getPorcentaje()).isEqualTo(20);
        assertThat(r.getEstado()).isEqualTo(EstadoRecomendacion.PENDIENTE);
        assertThat(r.getFuente()).isEqualTo("REGLAS");
        assertThat(r.getJustificacion()).contains("20 %").contains("Fiestas Patrias");
    }

    @Test
    @DisplayName("No se puede decidir dos veces la misma recomendación")
    void noDecideDosVeces() {
        RecomendacionTarifa aprobada = RecomendacionTarifa.builder().id(5L).estado(EstadoRecomendacion.APROBADA)
                .fechaInicio(LocalDate.now().plusDays(5)).fechaFin(LocalDate.now().plusDays(6)).porcentaje(20).build();
        when(recomendacionRepository.findById(5L)).thenReturn(Optional.of(aprobada));

        assertThatThrownBy(() -> motor.decidir(5L, true, null, "ok", "admin"))
                .hasMessageContaining("ya fue");
        verify(tarifaRepository, never()).save(any());
    }
}
