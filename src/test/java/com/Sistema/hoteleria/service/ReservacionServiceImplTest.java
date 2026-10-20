package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.ReservacionDTO;
import com.Sistema.hoteleria.dto.ReservacionRequestDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.model.entity.Estadia;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.entity.Huesped;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.HuespedRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.service.impl.ReservacionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservacionServiceImplTest {

    @Mock private ReservacionRepository reservacionRepository;
    @Mock private HuespedRepository huespedRepository;
    @Mock private HabitacionRepository habitacionRepository;
    @Mock private EstadiaRepository estadiaRepository;

    @InjectMocks private ReservacionServiceImpl service;

    private Huesped huesped;
    private Habitacion habitacion;

    @BeforeEach
    void preparar() {
        huesped = Huesped.builder().id(1L).nombres("Ana").apellidos("Quispe").build();
        habitacion = Habitacion.builder()
                .id(5L).numero("201").piso(2).tipo(TipoHabitacion.DOBLE)
                .capacidad(2).precioPorNoche(new BigDecimal("100.00"))
                .estado(EstadoHabitacion.DISPONIBLE).build();
    }

    private ReservacionRequestDTO solicitud(LocalDate entrada, LocalDate salida) {
        return ReservacionRequestDTO.builder()
                .huespedId(1L).habitacionId(5L)
                .fechaEntrada(entrada).fechaSalida(salida)
                .numeroPersonas(2).precioTotal(new BigDecimal("1.00"))
                .build();
    }

    @Test
    @DisplayName("Rechaza una reserva que se cruza con otra de la misma habitación")
    void rechazaSolapamiento() {
        when(huespedRepository.findById(1L)).thenReturn(Optional.of(huesped));
        when(habitacionRepository.findById(5L)).thenReturn(Optional.of(habitacion));
        when(estadiaRepository.findByHabitacionIdAndEstado(5L, EstadoEstadia.ACTIVA)).thenReturn(Optional.empty());
        when(reservacionRepository.contarReservasSolapadas(any(), any(), any())).thenReturn(1L);

        LocalDate entrada = LocalDate.now().plusDays(3);
        assertThatThrownBy(() -> service.crear(solicitud(entrada, entrada.plusDays(2))))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ya tiene una reserva");
        verify(reservacionRepository, never()).save(any());
    }

    @Test
    @DisplayName("El precio lo calcula el servidor: noches x tarifa, ignorando el valor del cliente")
    void calculaPrecioEnServidor() {
        when(huespedRepository.findById(1L)).thenReturn(Optional.of(huesped));
        when(habitacionRepository.findById(5L)).thenReturn(Optional.of(habitacion));
        when(estadiaRepository.findByHabitacionIdAndEstado(5L, EstadoEstadia.ACTIVA)).thenReturn(Optional.empty());
        when(reservacionRepository.contarReservasSolapadas(any(), any(), any())).thenReturn(0L);
        when(reservacionRepository.save(any(Reservacion.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDate entrada = LocalDate.now().plusDays(1);
        ReservacionDTO r = service.crear(solicitud(entrada, entrada.plusDays(3)));

        assertThat(r.getPrecioTotal()).isEqualByComparingTo("300.00");
        assertThat(r.getEstado()).isEqualTo(EstadoReservacion.CONFIRMADA);
    }

    @Test
    @DisplayName("No permite reservar una habitación ocupada por una estadía activa")
    void rechazaHabitacionOcupada() {
        Estadia activa = Estadia.builder().estado(EstadoEstadia.ACTIVA)
                .fechaSalidaEsperada(LocalDate.now().plusDays(5)).build();
        when(huespedRepository.findById(1L)).thenReturn(Optional.of(huesped));
        when(habitacionRepository.findById(5L)).thenReturn(Optional.of(habitacion));
        when(estadiaRepository.findByHabitacionIdAndEstado(5L, EstadoEstadia.ACTIVA)).thenReturn(Optional.of(activa));

        LocalDate hoy = LocalDate.now();
        assertThatThrownBy(() -> service.crear(solicitud(hoy, hoy.plusDays(2))))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ocupada hasta");
    }

    @Test
    @DisplayName("Rechaza más personas que la capacidad de la habitación")
    void rechazaCapacidad() {
        when(huespedRepository.findById(1L)).thenReturn(Optional.of(huesped));
        when(habitacionRepository.findById(5L)).thenReturn(Optional.of(habitacion));
        ReservacionRequestDTO dto = solicitud(LocalDate.now().plusDays(1), LocalDate.now().plusDays(2));
        dto.setNumeroPersonas(4);

        assertThatThrownBy(() -> service.crear(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("capacidad");
    }

    @Test
    @DisplayName("No se puede cancelar una reserva que ya tiene check-in")
    void noCancelaReservaEnCurso() {
        Reservacion enCurso = Reservacion.builder().id(9L).habitacion(habitacion)
                .estado(EstadoReservacion.EN_CURSO).build();
        when(reservacionRepository.findById(9L)).thenReturn(Optional.of(enCurso));

        assertThatThrownBy(() -> service.cancelar(9L, "cambio de planes"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("check-in");
    }
}
