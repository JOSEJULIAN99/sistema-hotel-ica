package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.AsistenteRespuestaDTO;
import com.Sistema.hoteleria.dto.HabitacionDTO;
import com.Sistema.hoteleria.dto.OpcionHabitacionDTO;
import com.Sistema.hoteleria.dto.RecomendacionRequestDTO;
import com.Sistema.hoteleria.dto.TareaLimpiezaDTO;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.enums.EstadoLimpieza;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.model.enums.PrioridadLimpieza;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.service.ia.AsistenteIAService;
import com.Sistema.hoteleria.service.ia.ClienteModeloIA;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AsistenteIAServiceTest {

    @Mock private HabitacionService habitacionService;
    @Mock private DashboardService dashboardService;
    @Mock private TareaLimpiezaService tareaLimpiezaService;
    @Mock private EstadiaRepository estadiaRepository;
    @Mock private ReservacionRepository reservacionRepository;
    @Mock private ClienteModeloIA clienteIA;

    @InjectMocks private AsistenteIAService asistente;

    private static HabitacionDTO hab(long id, String numero, int capacidad, String precio) {
        return HabitacionDTO.builder().id(id).numero(numero).tipo(TipoHabitacion.DOBLE)
                .capacidad(capacidad).precioPorNoche(new BigDecimal(precio)).build();
    }

    @Test
    @DisplayName("Recomienda solo habitaciones con capacidad y dentro del presupuesto, la más ajustada primero")
    void recomiendaPorCapacidadYPresupuesto() {
        LocalDate entrada = LocalDate.now().plusDays(1);
        LocalDate salida = entrada.plusDays(2);
        when(habitacionService.buscarDisponibles(entrada, salida)).thenReturn(List.of(
                hab(1, "101", 1, "90.00"),
                hab(2, "102", 2, "140.00"),
                hab(3, "301", 4, "250.00"),
                hab(4, "202", 2, "120.00")));
        when(clienteIA.completar(anyString(), anyString())).thenReturn(Optional.empty());

        RecomendacionRequestDTO req = new RecomendacionRequestDTO();
        req.setFechaEntrada(entrada);
        req.setFechaSalida(salida);
        req.setNumeroPersonas(2);
        req.setPresupuestoPorNoche(new BigDecimal("150.00"));

        AsistenteRespuestaDTO<List<OpcionHabitacionDTO>> r = asistente.recomendarHabitaciones(req);

        assertThat(r.getFuente()).isEqualTo("REGLAS");
        assertThat(r.getDatos()).extracting(OpcionHabitacionDTO::getNumero).containsExactly("202", "102");
        assertThat(r.getDatos().get(0).getTotalEstimado()).isEqualByComparingTo("240.00");
    }

    @Test
    @DisplayName("Si el modelo responde, el texto es de la IA pero las opciones siguen saliendo de la base de datos")
    void usaTextoDeIa() {
        LocalDate entrada = LocalDate.now().plusDays(1);
        LocalDate salida = entrada.plusDays(1);
        when(habitacionService.buscarDisponibles(entrada, salida)).thenReturn(List.of(hab(4, "202", 2, "120.00")));
        when(clienteIA.completar(anyString(), anyString())).thenReturn(Optional.of("La 202 es la mejor opción."));

        RecomendacionRequestDTO req = new RecomendacionRequestDTO();
        req.setFechaEntrada(entrada);
        req.setFechaSalida(salida);
        req.setNumeroPersonas(2);

        AsistenteRespuestaDTO<List<OpcionHabitacionDTO>> r = asistente.recomendarHabitaciones(req);

        assertThat(r.getFuente()).isEqualTo("IA");
        assertThat(r.getDatos()).hasSize(1);
    }

    @Test
    @DisplayName("Limpieza: primero la habitación que recibe huésped hoy, aunque tenga menor prioridad")
    void priorizaCheckInDeHoy() {
        TareaLimpiezaDTO alta = TareaLimpiezaDTO.builder().id(1L)
                .habitacion(HabitacionDTO.builder().id(1L).numero("101").build())
                .prioridad(PrioridadLimpieza.ALTA).estado(EstadoLimpieza.PENDIENTE).tipoLimpieza("CHECKOUT")
                .fechaCreacion(LocalDateTime.now().minusHours(3)).build();
        TareaLimpiezaDTO media = TareaLimpiezaDTO.builder().id(2L)
                .habitacion(HabitacionDTO.builder().id(2L).numero("102").build())
                .prioridad(PrioridadLimpieza.MEDIA).estado(EstadoLimpieza.PENDIENTE).tipoLimpieza("RUTINARIA")
                .fechaCreacion(LocalDateTime.now().minusHours(1)).build();
        when(tareaLimpiezaService.obtenerPendientes()).thenReturn(List.of(alta, media));

        Reservacion llegaHoy = Reservacion.builder()
                .habitacion(Habitacion.builder().id(2L).build())
                .estado(EstadoReservacion.CONFIRMADA).build();
        when(reservacionRepository.findByFechaEntrada(LocalDate.now())).thenReturn(List.of(llegaHoy));
        when(clienteIA.completar(anyString(), anyString())).thenReturn(Optional.empty());

        AsistenteRespuestaDTO<List<TareaLimpiezaDTO>> r = asistente.limpiezaPriorizada();

        assertThat(r.getDatos()).extracting(TareaLimpiezaDTO::getId).containsExactly(2L, 1L);
        assertThat(r.getMensaje()).contains("102");
    }
}
