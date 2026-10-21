package com.Sistema.hoteleria.service;

import com.Sistema.hoteleria.dto.ChatRequestDTO;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.model.enums.TipoHabitacion;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.service.ia.ChatHuespedService;
import com.Sistema.hoteleria.service.ia.ClienteModeloIA;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatHuespedServiceTest {

    @Mock private ClienteModeloIA clienteIA;
    @Mock private ConfiguracionService configuracionService;
    @Mock private HabitacionRepository habitacionRepository;

    @InjectMocks private ChatHuespedService chat;

    private static ChatRequestDTO pregunta(String texto) {
        ChatRequestDTO.MensajeChatDTO m = new ChatRequestDTO.MensajeChatDTO();
        m.setRol("usuario");
        m.setContenido(texto);
        ChatRequestDTO req = new ChatRequestDTO();
        req.setMensajes(List.of(m));
        return req;
    }

    @Test
    @DisplayName("Sin IA, responde el horario con la información que configuró el administrador")
    void respondeHorarioPorReglas() {
        when(clienteIA.conversar(anyString(), anyList())).thenReturn(Optional.empty());
        when(configuracionService.obtenerEntidad()).thenReturn(ConfiguracionService.porDefecto());

        Map<String, Object> r = chat.responder(pregunta("¿A qué hora es el check-in?"));

        assertThat(r.get("fuente")).isEqualTo("REGLAS");
        assertThat(r.get("respuesta").toString()).contains("14:00").contains("12:00");
    }

    @Test
    @DisplayName("Sin IA, las tarifas salen de la base de datos y excluyen habitaciones en mantenimiento")
    void respondeTarifasDesdeBaseDeDatos() {
        when(clienteIA.conversar(anyString(), anyList())).thenReturn(Optional.empty());
        when(configuracionService.obtenerEntidad()).thenReturn(ConfiguracionService.porDefecto());
        when(habitacionRepository.findAll()).thenReturn(List.of(
                Habitacion.builder().tipo(TipoHabitacion.DOBLE).precioPorNoche(new BigDecimal("140.00"))
                        .capacidad(2).estado(EstadoHabitacion.DISPONIBLE).build(),
                Habitacion.builder().tipo(TipoHabitacion.DOBLE).precioPorNoche(new BigDecimal("120.00"))
                        .capacidad(2).estado(EstadoHabitacion.OCUPADA).build(),
                Habitacion.builder().tipo(TipoHabitacion.SUITE).precioPorNoche(new BigDecimal("80.00"))
                        .capacidad(4).estado(EstadoHabitacion.MANTENIMIENTO).build()));

        String respuesta = chat.responder(pregunta("¿Cuál es el precio por noche?")).get("respuesta").toString();

        assertThat(respuesta).contains("DOBLE: desde S/ 120.00").doesNotContain("SUITE");
    }

    @Test
    @DisplayName("Con IA, devuelve el texto del modelo")
    void usaIa() {
        when(clienteIA.conversar(anyString(), anyList())).thenReturn(Optional.of("Check-in is from 2 pm."));

        Map<String, Object> r = chat.responder(pregunta("What time is check-in?"));

        assertThat(r.get("fuente")).isEqualTo("IA");
        assertThat(r.get("respuesta")).isEqualTo("Check-in is from 2 pm.");
    }
}
