package com.Sistema.hoteleria.config;

import com.Sistema.hoteleria.model.entity.*;
import com.Sistema.hoteleria.model.enums.*;
import com.Sistema.hoteleria.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final HabitacionRepository habitacionRepository;
    private final HuespedRepository huespedRepository;
    private final ReservacionRepository reservacionRepository;
    private final EstadiaRepository estadiaRepository;
    private final TareaLimpiezaRepository tareaLimpiezaRepository;
    private final ConsumoServicioRepository consumoServicioRepository;
    private final PagoRepository pagoRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (habitacionRepository.count() > 0) {
            log.info("Datos iniciales ya existen. Omitiendo seed.");
            return;
        }

        log.info("Inicializando datos de prueba para Hotel Princes Ica...");

        // 1. Usuarios / Personal del Hotel
        Usuario pablo = usuarioRepository.save(Usuario.builder()
                .username("pluna")
                .password("hotel123")
                .nombreCompleto("Pablo Luna")
                .email("pluna@hotelprincesica.com")
                .telefono("956123456")
                .rol(RolUsuario.RECEPCIONISTA)
                .turno("Tarde")
                .activo(true)
                .build());

        Usuario maria = usuarioRepository.save(Usuario.builder()
                .username("mgomez")
                .password("hotel123")
                .nombreCompleto("María Gómez")
                .email("mgomez@hotelprincesica.com")
                .telefono("956789123")
                .rol(RolUsuario.RECEPCIONISTA)
                .turno("Mañana")
                .activo(true)
                .build());

        Usuario rosa = usuarioRepository.save(Usuario.builder()
                .username("rflores")
                .password("hotel123")
                .nombreCompleto("Rosa Flores")
                .email("rflores@hotelprincesica.com")
                .telefono("956321654")
                .rol(RolUsuario.LIMPIEZA)
                .turno("Mañana")
                .activo(true)
                .build());

        Usuario admin = usuarioRepository.save(Usuario.builder()
                .username("admin")
                .password("admin123")
                .nombreCompleto("Administrador Principal")
                .email("admin@hotelprincesica.com")
                .telefono("999888777")
                .rol(RolUsuario.ADMINISTRADOR)
                .turno("General")
                .activo(true)
                .build());

        // 2. Habitaciones
        Habitacion h101 = habitacionRepository.save(Habitacion.builder()
                .numero("101")
                .piso(1)
                .tipo(TipoHabitacion.INDIVIDUAL)
                .precioPorNoche(new BigDecimal("90.00"))
                .capacidad(1)
                .estado(EstadoHabitacion.DISPONIBLE)
                .descripcion("Habitación simple acogedora con cama de 1.5 plazas, baño privado y aire acondicionado.")
                .caracteristicas("WiFi 5G, Smart TV 43\", Aire Acondicionado, Ducha Caliente")
                .build());

        Habitacion h102 = habitacionRepository.save(Habitacion.builder()
                .numero("102")
                .piso(1)
                .tipo(TipoHabitacion.DOBLE)
                .precioPorNoche(new BigDecimal("140.00"))
                .capacidad(2)
                .estado(EstadoHabitacion.OCUPADA)
                .descripcion("Habitación doble con 2 camas de 1.5 plazas, ideal para viajeros o amigos.")
                .caracteristicas("WiFi 5G, Smart TV 50\", A/C, Frigobar, Escritorio")
                .build());

        Habitacion h103 = habitacionRepository.save(Habitacion.builder()
                .numero("103")
                .piso(1)
                .tipo(TipoHabitacion.MATRIMONIAL)
                .precioPorNoche(new BigDecimal("160.00"))
                .capacidad(2)
                .estado(EstadoHabitacion.LIMPIEZA)
                .descripcion("Habitación matrimonial con cama Queen Size y vista al jardín interior.")
                .caracteristicas("Cama Queen, WiFi 5G, Smart TV 55\", Frigobar, A/C")
                .build());

        Habitacion h201 = habitacionRepository.save(Habitacion.builder()
                .numero("201")
                .piso(2)
                .tipo(TipoHabitacion.MATRIMONIAL)
                .precioPorNoche(new BigDecimal("170.00"))
                .capacidad(2)
                .estado(EstadoHabitacion.DISPONIBLE)
                .descripcion("Habitación matrimonial superior en segundo piso con balcón.")
                .caracteristicas("Balcón Privado, Cama King, WiFi 5G, TV 55\", Frigobar, A/C")
                .build());

        Habitacion h202 = habitacionRepository.save(Habitacion.builder()
                .numero("202")
                .piso(2)
                .tipo(TipoHabitacion.SUITE)
                .precioPorNoche(new BigDecimal("240.00"))
                .capacidad(2)
                .estado(EstadoHabitacion.RESERVADA)
                .descripcion("Suite Deluxe con jacuzzi privado y vista panorámica a la piscina y oasis.")
                .caracteristicas("Jacuzzi Privado, Sala de Estar, Cama King, Frigobar Premium, WiFi 5G")
                .build());

        Habitacion h203 = habitacionRepository.save(Habitacion.builder()
                .numero("203")
                .piso(2)
                .tipo(TipoHabitacion.FAMILIAR)
                .precioPorNoche(new BigDecimal("260.00"))
                .capacidad(4)
                .estado(EstadoHabitacion.DISPONIBLE)
                .descripcion("Habitación espaciosa para familias con 1 cama matrimonial y 2 camas individuales.")
                .caracteristicas("2 Ambientes, 2 Baños, Smart TV x2, Frigobar, A/C, WiFi 5G")
                .build());

        Habitacion h301 = habitacionRepository.save(Habitacion.builder()
                .numero("301")
                .piso(3)
                .tipo(TipoHabitacion.SUITE)
                .precioPorNoche(new BigDecimal("320.00"))
                .capacidad(3)
                .estado(EstadoHabitacion.DISPONIBLE)
                .descripcion("Suite Presidencial con terraza privada, jacuzzi exterior y vista a la puesta de sol de Huacachina.")
                .caracteristicas("Terraza Privada, Jacuzzi Panorámico, Cama Super King, Bar Integrado, WiFi 5G")
                .build());

        Habitacion h302 = habitacionRepository.save(Habitacion.builder()
                .numero("302")
                .piso(3)
                .tipo(TipoHabitacion.DOBLE)
                .precioPorNoche(new BigDecimal("150.00"))
                .capacidad(2)
                .estado(EstadoHabitacion.MANTENIMIENTO)
                .descripcion("Habitación doble en mantenimiento preventivo de aire acondicionado.")
                .caracteristicas("2 Camas, WiFi 5G, TV 50\"")
                .build());

        // 3. Huéspedes de ejemplo
        Huesped juan = huespedRepository.save(Huesped.builder()
                .nombres("Juan Carlos")
                .apellidos("Pérez Morales")
                .tipoDocumento(TipoDocumento.DNI)
                .numeroDocumento("45892134")
                .telefono("987654321")
                .email("juan.perez@gmail.com")
                .nacionalidad("Peruana")
                .ciudadProcedencia("Lima")
                .build());

        Huesped ana = huespedRepository.save(Huesped.builder()
                .nombres("Ana Lucía")
                .apellidos("Mendoza Vargas")
                .tipoDocumento(TipoDocumento.DNI)
                .numeroDocumento("72415689")
                .telefono("954321987")
                .email("ana.mendoza@hotmail.com")
                .nacionalidad("Peruana")
                .ciudadProcedencia("Arequipa")
                .build());

        Huesped roberto = huespedRepository.save(Huesped.builder()
                .nombres("Roberto Carlos")
                .apellidos("Silva Fernandez")
                .tipoDocumento(TipoDocumento.PASAPORTE)
                .numeroDocumento("AB928172")
                .telefono("+56912345678")
                .email("roberto.silva@outlook.com")
                .nacionalidad("Chilena")
                .ciudadProcedencia("Santiago de Chile")
                .build());

        // 4. Reservación de ejemplo (Para h202)
        Reservacion res202 = reservacionRepository.save(Reservacion.builder()
                .codigoReserva("RES-260916-001")
                .huesped(roberto)
                .habitacion(h202)
                .fechaEntrada(LocalDate.now())
                .fechaSalida(LocalDate.now().plusDays(2))
                .numeroPersonas(2)
                .precioTotal(new BigDecimal("480.00"))
                .adelanto(new BigDecimal("200.00"))
                .estado(EstadoReservacion.CONFIRMADA)
                .observaciones("Huésped solicita late check-in a las 7:00 PM y cuna para infante")
                .build());

        // 5. Estadía activa (Para h102 con Juan Pérez)
        Estadia estadia102 = Estadia.builder()
                .huesped(juan)
                .habitacion(h102)
                .fechaIngreso(LocalDateTime.now().minusDays(1))
                .fechaSalidaEsperada(LocalDate.now().plusDays(1))
                .totalHospedaje(new BigDecimal("280.00")) // 2 noches x 140
                .totalConsumos(new BigDecimal("35.00"))
                .descuento(BigDecimal.ZERO)
                .totalPagar(new BigDecimal("315.00"))
                .estado(EstadoEstadia.ACTIVA)
                .observaciones("Huésped solicita toallas adicionales por la mañana")
                .build();
        estadia102 = estadiaRepository.save(estadia102);

        // Consumos de la estadía activa
        consumoServicioRepository.save(ConsumoServicio.builder()
                .estadia(estadia102)
                .nombreServicio("Pisco Sour Queirolo (Bar)")
                .cantidad(1)
                .precioUnitario(new BigDecimal("25.00"))
                .subtotal(new BigDecimal("25.00"))
                .fechaConsumo(LocalDateTime.now().minusHours(5))
                .build());

        consumoServicioRepository.save(ConsumoServicio.builder()
                .estadia(estadia102)
                .nombreServicio("Agua Mineral San Mateo 1L")
                .cantidad(2)
                .precioUnitario(new BigDecimal("5.00"))
                .subtotal(new BigDecimal("10.00"))
                .fechaConsumo(LocalDateTime.now().minusHours(3))
                .build());

        // Pago parcial registrado para la estadía activa
        pagoRepository.save(Pago.builder()
                .estadia(estadia102)
                .monto(new BigDecimal("150.00"))
                .metodoPago(MetodoPago.YAPE)
                .fechaPago(LocalDateTime.now().minusDays(1))
                .nroOperacion("YAPE-948210")
                .tipoComprobante("BOLETA")
                .notas("Pago inicial al momento del Check-In")
                .build());

        // 6. Tarea de Limpieza pendiente para Habitación 103
        tareaLimpiezaRepository.save(TareaLimpieza.builder()
                .habitacion(h103)
                .empleadoAsignado(rosa)
                .tipoLimpieza("CHECKOUT")
                .estado(EstadoLimpieza.PENDIENTE)
                .prioridad(PrioridadLimpieza.ALTA)
                .observaciones("Check-out realizado a las 11:00 AM. Requiere cambio de sábanas y desinfección completa.")
                .fechaCreacion(LocalDateTime.now().minusHours(2))
                .build());

        log.info("Inicialización de datos completada con éxito. Servidor listo en http://localhost:8080");
    }
}
