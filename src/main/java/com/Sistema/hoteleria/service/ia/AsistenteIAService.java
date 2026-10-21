package com.Sistema.hoteleria.service.ia;

import com.Sistema.hoteleria.dto.AsistenteRespuestaDTO;
import com.Sistema.hoteleria.dto.DashboardStatsDTO;
import com.Sistema.hoteleria.dto.HabitacionDTO;
import com.Sistema.hoteleria.dto.OpcionHabitacionDTO;
import com.Sistema.hoteleria.dto.RecomendacionRequestDTO;
import com.Sistema.hoteleria.dto.TareaLimpiezaDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.model.enums.PrioridadLimpieza;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.service.ConfiguracionService;
import com.Sistema.hoteleria.service.DashboardService;
import com.Sistema.hoteleria.service.HabitacionService;
import com.Sistema.hoteleria.service.TareaLimpiezaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Asistente de apoyo a la decisión.
 * - Los datos (habitaciones, tareas, métricas) siempre salen de la base de datos con reglas fijas.
 * - El modelo de IA, si está configurado, solo redacta la explicación en lenguaje natural.
 * - Nunca ejecuta operaciones: reservar, asignar o cambiar estados lo decide una persona.
 * - Al modelo no se envían nombres, documentos ni teléfonos de huéspedes.
 */
@Service
@RequiredArgsConstructor
public class AsistenteIAService {

    private static final String FUENTE_IA = "IA";
    private static final String FUENTE_REGLAS = "REGLAS";

    private static final String INSTRUCCION_BASE =
            "Eres el asistente interno de un hotel en Ica, Perú. Respondes en español, "
            + "en un máximo de 4 oraciones, con tono profesional. Usa solo los datos entregados: "
            + "no inventes habitaciones, precios ni cifras. Montos en soles (S/).";

    private final HabitacionService habitacionService;
    private final DashboardService dashboardService;
    private final TareaLimpiezaService tareaLimpiezaService;
    private final EstadiaRepository estadiaRepository;
    private final ReservacionRepository reservacionRepository;
    private final ClienteModeloIA clienteIA;
    private final ConfiguracionService configuracionService;

    // ==================== 1. RECOMENDADOR DE HABITACIÓN ====================

    @Transactional(readOnly = true)
    public AsistenteRespuestaDTO<List<OpcionHabitacionDTO>> recomendarHabitaciones(RecomendacionRequestDTO req) {
        if (!req.getFechaSalida().isAfter(req.getFechaEntrada())) {
            throw new BadRequestException("La fecha de salida debe ser posterior a la fecha de entrada");
        }
        long noches = ChronoUnit.DAYS.between(req.getFechaEntrada(), req.getFechaSalida());

        // Habitaciones ocupadas por estadías activas que aún no salen en la fecha pedida
        Set<Long> ocupadas = estadiaRepository.findEstadiasActivas().stream()
                .filter(e -> e.getFechaSalidaEsperada().isAfter(req.getFechaEntrada()))
                .map(e -> e.getHabitacion().getId())
                .collect(Collectors.toSet());

        List<OpcionHabitacionDTO> opciones = habitacionService
                .buscarDisponibles(req.getFechaEntrada(), req.getFechaSalida()).stream()
                .filter(h -> !ocupadas.contains(h.getId()))
                .filter(h -> h.getCapacidad() >= req.getNumeroPersonas())
                .filter(h -> req.getPresupuestoPorNoche() == null
                        || h.getPrecioPorNoche().compareTo(req.getPresupuestoPorNoche()) <= 0)
                // Primero la capacidad más ajustada al grupo, luego el menor precio
                .sorted(Comparator.comparingInt((HabitacionDTO h) -> h.getCapacidad() - req.getNumeroPersonas())
                        .thenComparing(HabitacionDTO::getPrecioPorNoche))
                .limit(3)
                .map(h -> aOpcion(h, noches, req.getNumeroPersonas()))
                .toList();

        if (opciones.isEmpty()) {
            return AsistenteRespuestaDTO.<List<OpcionHabitacionDTO>>builder()
                    .fuente(FUENTE_REGLAS)
                    .mensaje("No hay habitaciones libres para " + req.getNumeroPersonas() + " persona(s) entre "
                            + req.getFechaEntrada() + " y " + req.getFechaSalida()
                            + (req.getPresupuestoPorNoche() != null ? " dentro del presupuesto indicado" : "")
                            + ". Pruebe otras fechas o un presupuesto mayor.")
                    .datos(opciones)
                    .build();
        }

        String mensajeReglas = "Opción sugerida: habitación " + opciones.get(0).getNumero()
                + " (" + opciones.get(0).getTipo() + "), " + opciones.get(0).getMotivo() + ".";

        String datosParaIA = opciones.stream()
                .map(o -> "- Habitación " + o.getNumero() + ": " + o.getTipo() + ", capacidad " + o.getCapacidad()
                        + ", S/ " + o.getPrecioPorNoche() + " por noche, total S/ " + o.getTotalEstimado()
                        + ", características: " + (o.getCaracteristicas() != null ? o.getCaracteristicas() : "no indicadas"))
                .collect(Collectors.joining("\n"));
        String pedido = "Un recepcionista atiende a " + req.getNumeroPersonas() + " persona(s) por " + noches
                + " noche(s). Preferencias del huésped: "
                + (req.getPreferencias() != null && !req.getPreferencias().isBlank() ? req.getPreferencias() : "ninguna")
                + ".\nHabitaciones libres ya filtradas por el sistema:\n" + datosParaIA
                + "\nIndica cuál conviene más y por qué, mencionando solo habitaciones de esta lista.";

        return clienteIA.completar(instruccion(), pedido)
                .map(texto -> AsistenteRespuestaDTO.<List<OpcionHabitacionDTO>>builder()
                        .fuente(FUENTE_IA).mensaje(texto).datos(opciones).build())
                .orElseGet(() -> AsistenteRespuestaDTO.<List<OpcionHabitacionDTO>>builder()
                        .fuente(FUENTE_REGLAS).mensaje(mensajeReglas).datos(opciones).build());
    }

    private OpcionHabitacionDTO aOpcion(HabitacionDTO h, long noches, int personas) {
        BigDecimal total = h.getPrecioPorNoche().multiply(BigDecimal.valueOf(noches));
        String motivo = "capacidad para " + h.getCapacidad() + " (grupo de " + personas + "), S/ "
                + h.getPrecioPorNoche() + " por noche y S/ " + total + " por " + noches + " noche(s)";
        return OpcionHabitacionDTO.builder()
                .habitacionId(h.getId())
                .numero(h.getNumero())
                .tipo(h.getTipo())
                .capacidad(h.getCapacidad())
                .precioPorNoche(h.getPrecioPorNoche())
                .totalEstimado(total)
                .caracteristicas(h.getCaracteristicas())
                .motivo(motivo)
                .build();
    }

    // ==================== 2. RESUMEN DIARIO DE GESTIÓN ====================

    @Transactional(readOnly = true)
    public AsistenteRespuestaDTO<DashboardStatsDTO> resumenDiario() {
        DashboardStatsDTO m = dashboardService.obtenerEstadisticas();

        StringBuilder reglas = new StringBuilder()
                .append("Ocupación del ").append(m.getPorcentajeOcupacion()).append(" % (")
                .append(m.getHabitacionesOcupadas()).append(" de ").append(m.getTotalHabitaciones())
                .append(" habitaciones). Hoy hay ").append(m.getCheckInsHoy()).append(" check-in y ")
                .append(m.getCheckOutsHoy()).append(" check-out programados. Ingresos de hoy: S/ ")
                .append(m.getIngresosHoy()).append("; del mes: S/ ").append(m.getIngresosMes()).append(".");
        if (m.getTareasLimpiezaPendientes() > 0) {
            reglas.append(" Quedan ").append(m.getTareasLimpiezaPendientes()).append(" tareas de limpieza abiertas.");
        }
        if (m.getCheckInsHoy() > m.getHabitacionesDisponibles() + m.getHabitacionesReservadas()) {
            reglas.append(" Alerta: los check-in del día superan las habitaciones listas; priorice la limpieza.");
        }

        String pedido = "Redacta el resumen de inicio de turno para el gerente con estas métricas del día "
                + "y una recomendación concreta:\n"
                + "- Habitaciones: " + m.getTotalHabitaciones() + " en total, " + m.getHabitacionesDisponibles()
                + " disponibles, " + m.getHabitacionesOcupadas() + " ocupadas, " + m.getHabitacionesReservadas()
                + " reservadas, " + m.getHabitacionesEnLimpieza() + " en limpieza, "
                + m.getHabitacionesEnMantenimiento() + " en mantenimiento\n"
                + "- Ocupación: " + m.getPorcentajeOcupacion() + " %\n"
                + "- Check-in programados hoy: " + m.getCheckInsHoy() + "; check-out: " + m.getCheckOutsHoy() + "\n"
                + "- Reservas por atender: " + m.getReservacionesPendientes() + "\n"
                + "- Tareas de limpieza abiertas: " + m.getTareasLimpiezaPendientes() + "\n"
                + "- Ingresos hoy: S/ " + m.getIngresosHoy() + "; mes: S/ " + m.getIngresosMes();

        return clienteIA.completar(instruccion(), pedido)
                .map(texto -> AsistenteRespuestaDTO.<DashboardStatsDTO>builder()
                        .fuente(FUENTE_IA).mensaje(texto).datos(m).build())
                .orElseGet(() -> AsistenteRespuestaDTO.<DashboardStatsDTO>builder()
                        .fuente(FUENTE_REGLAS).mensaje(reglas.toString()).datos(m).build());
    }

    // ==================== 3. PRIORIZACIÓN DE LIMPIEZA ====================

    @Transactional(readOnly = true)
    public AsistenteRespuestaDTO<List<TareaLimpiezaDTO>> limpiezaPriorizada() {
        LocalDate hoy = LocalDate.now();

        // Habitaciones que reciben huésped hoy: se limpian primero
        Set<Long> conCheckInHoy = reservacionRepository.findByFechaEntrada(hoy).stream()
                .filter(r -> r.getEstado() == EstadoReservacion.CONFIRMADA || r.getEstado() == EstadoReservacion.PENDIENTE)
                .map((Reservacion r) -> r.getHabitacion().getId())
                .collect(Collectors.toSet());

        List<TareaLimpiezaDTO> tareas = tareaLimpiezaService.obtenerPendientes().stream()
                .sorted(Comparator
                        .comparing((TareaLimpiezaDTO t) -> !conCheckInHoy.contains(t.getHabitacion().getId()))
                        .thenComparingInt(t -> peso(t.getPrioridad()))
                        .thenComparing(TareaLimpiezaDTO::getFechaCreacion, Comparator.nullsLast(Comparator.<LocalDateTime>naturalOrder())))
                .toList();

        if (tareas.isEmpty()) {
            return AsistenteRespuestaDTO.<List<TareaLimpiezaDTO>>builder()
                    .fuente(FUENTE_REGLAS).mensaje("No hay tareas de limpieza pendientes.").datos(tareas).build();
        }

        String lista = tareas.stream()
                .map(t -> "- Habitación " + t.getHabitacion().getNumero() + ": prioridad " + t.getPrioridad()
                        + ", tipo " + t.getTipoLimpieza() + ", estado " + t.getEstado()
                        + (conCheckInHoy.contains(t.getHabitacion().getId()) ? ", recibe huésped hoy" : ""))
                .collect(Collectors.joining("\n"));

        long urgentesHoy = tareas.stream().filter(t -> conCheckInHoy.contains(t.getHabitacion().getId())).count();
        String reglas = "Orden sugerido: primero las " + urgentesHoy + " habitaciones que reciben huésped hoy, "
                + "luego por prioridad (URGENTE, ALTA, MEDIA, BAJA) y antigüedad. Empezar por la habitación "
                + tareas.get(0).getHabitacion().getNumero() + ".";

        String pedido = "Explica al equipo de limpieza el orden de trabajo de hoy. El sistema ya ordenó las tareas así:\n"
                + lista + "\nNo cambies el orden; explica brevemente el criterio y por dónde empezar.";

        return clienteIA.completar(instruccion(), pedido)
                .map(texto -> AsistenteRespuestaDTO.<List<TareaLimpiezaDTO>>builder()
                        .fuente(FUENTE_IA).mensaje(texto).datos(tareas).build())
                .orElseGet(() -> AsistenteRespuestaDTO.<List<TareaLimpiezaDTO>>builder()
                        .fuente(FUENTE_REGLAS).mensaje(reglas).datos(tareas).build());
    }

    /** Instrucción base + reglas que el administrador definió en el panel. */
    private String instruccion() {
        String reglas = configuracionService != null ? configuracionService.reglasAsistente() : null;
        return reglas == null || reglas.isBlank() ? INSTRUCCION_BASE
                : INSTRUCCION_BASE + "\nReglas del hotel: " + reglas;
    }

    private static int peso(PrioridadLimpieza p) {
        if (p == null) return 9;
        return switch (p) {
            case URGENTE -> 0;
            case ALTA -> 1;
            case MEDIA -> 2;
            case BAJA -> 3;
        };
    }

    /** Usado por pruebas y por el controlador para informar si la IA está activa. */
    public boolean iaHabilitada() {
        return clienteIA.habilitado();
    }

}
