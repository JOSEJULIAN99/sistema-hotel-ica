package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.CheckInRequestDTO;
import com.Sistema.hoteleria.dto.CheckOutRequestDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.model.entity.Estadia;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.entity.Huesped;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.repository.ConsumoServicioRepository;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.HuespedRepository;
import com.Sistema.hoteleria.repository.PagoRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.repository.TareaLimpiezaRepository;
import com.Sistema.hoteleria.service.impl.EstadiaServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EstadiaServiceImplTest {

    @Mock private EstadiaRepository estadiaRepository;
    @Mock private HabitacionRepository habitacionRepository;
    @Mock private HuespedRepository huespedRepository;
    @Mock private ReservacionRepository reservacionRepository;
    @Mock private TareaLimpiezaRepository tareaLimpiezaRepository;
    @Mock private PagoRepository pagoRepository;
    @Mock private ConsumoServicioRepository consumoServicioRepository;

    @InjectMocks private EstadiaServiceImpl service;

    @Test
    @DisplayName("Una reserva que ya está EN_CURSO no admite un segundo check-in")
    void rechazaDobleCheckIn() {
        Reservacion r = Reservacion.builder().id(1L).codigoReserva("RES-1")
                .estado(EstadoReservacion.EN_CURSO).build();
        when(reservacionRepository.findById(1L)).thenReturn(Optional.of(r));

        assertThatThrownBy(() -> service.realizarCheckIn(CheckInRequestDTO.builder().reservacionId(1L).build()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ya tiene check-in");
    }

    @Test
    @DisplayName("El check-in directo rechaza una habitación ocupada")
    void rechazaHabitacionOcupada() {
        Habitacion ocupada = Habitacion.builder().id(3L).numero("103").estado(EstadoHabitacion.OCUPADA).build();
        when(huespedRepository.findById(1L)).thenReturn(Optional.of(Huesped.builder().id(1L).build()));
        when(habitacionRepository.findById(3L)).thenReturn(Optional.of(ocupada));

        CheckInRequestDTO dto = CheckInRequestDTO.builder()
                .huespedId(1L).habitacionId(3L).fechaSalidaEsperada(LocalDate.now().plusDays(2)).build();

        assertThatThrownBy(() -> service.realizarCheckIn(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ocupada");
        verify(estadiaRepository, never()).save(any());
    }

    @Test
    @DisplayName("No se puede hacer check-out con saldo pendiente")
    void rechazaCheckOutConSaldo() {
        Estadia estadia = Estadia.builder().id(7L).estado(EstadoEstadia.ACTIVA)
                .totalHospedaje(new BigDecimal("200.00")).build();
        estadia.recalcularTotal();
        when(estadiaRepository.findById(7L)).thenReturn(Optional.of(estadia));

        CheckOutRequestDTO dto = CheckOutRequestDTO.builder().pagoFinal(new BigDecimal("50.00")).build();

        assertThatThrownBy(() -> service.realizarCheckOut(7L, dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("saldo pendiente");
        verify(pagoRepository, never()).save(any());
    }
}
