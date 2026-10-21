package com.Sistema.hoteleria.service.tarifas;

import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Estadia;
import com.Sistema.hoteleria.model.entity.EventoCalendario;
import com.Sistema.hoteleria.model.entity.RecomendacionTarifa;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.entity.TarifaTemporada;
import com.Sistema.hoteleria.model.enums.EstadoEstadia;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Motor de tarifas dinámicas (RF-12).
 * 1. Para cada noche calcula la ocupación prevista (reservas + estadías) y busca eventos del calendario.
 * 2. Aplica las reglas del administrador: % por tipo de evento, + % por ocupación alta, con tope.
 * 3. Agrupa noches seguidas con el mismo ajuste en una recomendación PENDIENTE.
 * 4. La IA redacta la justificación usando el historial de decisiones pasadas.
 * Ningún precio cambia hasta que el administrador aprueba; al aprobar se crea una TarifaTemporada.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MotorTarifasService {

    private static final List<EstadoReservacion> RESERVAS_VIGENTES =
            List.of(EstadoReservacion.PENDIENTE, EstadoReservacion.CONFIRMADA, EstadoReservacion.EN_CURSO);

    private final ConfiguracionService configuracionService;
    private final EventoCalendarioRepository eventoRepository;
    private final RecomendacionTarifaRepository recomendacionRepository;
    private final TarifaTemporadaRepository tarifaRepository;
    private final ReservacionRepository reservacionRepository;
    private final EstadiaRepository estadiaRepository;
    private final HabitacionRepository habitacionRepository;
    private final ClienteModeloIA clienteIA;

    /** Resultado del análisis de una noche. */
    record Noche(LocalDate fecha, int porcentaje, double ocupacion, List<String> eventos, List<String> motivos) { }

    // ==================== ANÁLISIS ====================

    /** Todos los días a las 06:00 (hora de Lima) revisa el horizonte configurado. */
    @Scheduled(cron = "0 0 6 * * *", zone = "America/Lima")
    @Transactional
    public void analisisDiario() {
        int horizonte = configuracionService.reglasTarifa().horizonteDias();
        LocalDate manana = LocalDate.now().plusDays(1);
        int nuevas = analizar(manana, manana.plusDays(horizonte - 1L), "sistema").size();
        log.info("Análisis diario de tarifas: {} recomendaciones nuevas", nuevas);
    }

    @Transactional
    public List<RecomendacionTarifa> analizar(LocalDate desde, LocalDate hasta, String usuario) {
        if (hasta.isBefore(desde)) {
            throw new BadRequestException("La fecha final debe ser igual o posterior a la inicial");
        }
        if (ChronoUnit.DAYS.between(desde, hasta) > 365) {
            throw new BadRequestException("Analice como máximo un año a la vez");
        }
        marcarVencidas();

        ReglasTarifa reglas = configuracionService.reglasTarifa();
        List<Noche> noches = evaluarNoches(desde, hasta, reglas);
        List<TarifaTemporada> vigentes = tarifaRepository.findActivasEnRango(desde, hasta);

        List<RecomendacionTarifa> nuevas = new ArrayList<>();
        for (List<Noche> grupo : agrupar(noches)) {
            LocalDate inicio = grupo.get(0).fecha();
            LocalDate fin = grupo.get(grupo.size() - 1).fecha();
            int porcentaje = grupo.get(0).porcentaje();

            boolean repetida = recomendacionRepository.existsByFechaInicioAndFechaFinAndPorcentajeAndEstadoIn(
                    inicio, fin, porcentaje, List.of(EstadoRecomendacion.PENDIENTE, EstadoRecomendacion.APROBADA));
            boolean yaCubierta = grupo.stream().allMatch(n ->
                    CalculadoraTarifa.porcentajeNoche(n.fecha(), null, vigentes) >= porcentaje);
            if (repetida || yaCubierta) {
                continue;
            }

            double ocupacion = grupo.stream().mapToDouble(Noche::ocupacion).average().orElse(0);
            Set<String> eventos = new LinkedHashSet<>();
            Set<String> motivos = new LinkedHashSet<>();
            grupo.forEach(n -> { eventos.addAll(n.eventos()); motivos.addAll(n.motivos()); });

            RecomendacionTarifa rec = RecomendacionTarifa.builder()
                    .fechaInicio(inicio)
                    .fechaFin(fin)
                    .porcentaje(porcentaje)
                    .ocupacionPrevista(redondear(ocupacion))
                    .eventos(String.join(", ", eventos))
                    .motivo(String.join("; ", motivos))
                    .estado(EstadoRecomendacion.PENDIENTE)
                    .generadoPor(usuario)
                    .build();
            justificar(rec);
            nuevas.add(recomendacionRepository.save(rec));
        }
        return nuevas;
    }

    /** Calcula el % sugerido de cada noche según eventos y ocupación prevista. */
    List<Noche> evaluarNoches(LocalDate desde, LocalDate hasta, ReglasTarifa reglas) {
        long habitaciones = habitacionRepository.findAll().stream()
                .filter(h -> h.getEstado() != EstadoHabitacion.MANTENIMIENTO).count();
        List<EventoCalendario> eventos = eventoRepository.findActivosEnRango(desde, hasta);
        List<Reservacion> reservas = reservacionRepository.findAll().stream()
                .filter(r -> RESERVAS_VIGENTES.contains(r.getEstado()))
                .filter(r -> r.getFechaEntrada().isBefore(hasta.plusDays(1)) && r.getFechaSalida().isAfter(desde))
                .toList();
        // Estadías sin reserva (walk-in); las que vienen de una reserva ya se cuentan como EN_CURSO
        List<Estadia> walkIns = estadiaRepository.findByEstado(EstadoEstadia.ACTIVA).stream()
                .filter(e -> e.getReservacion() == null)
                .toList();

        List<Noche> resultado = new ArrayList<>();
        for (LocalDate d = desde; !d.isAfter(hasta); d = d.plusDays(1)) {
            final LocalDate dia = d;
            long ocupadas = reservas.stream()
                    .filter(r -> !dia.isBefore(r.getFechaEntrada()) && dia.isBefore(r.getFechaSalida())).count()
                    + walkIns.stream()
                    .filter(e -> !dia.isBefore(e.getFechaIngreso().toLocalDate()) && dia.isBefore(e.getFechaSalidaEsperada())).count();
            double ocupacion = habitaciones > 0 ? Math.min(100.0, ocupadas * 100.0 / habitaciones) : 0;

            int porcentaje = 0;
            List<String> nombres = new ArrayList<>();
            List<String> motivos = new ArrayList<>();
            for (EventoCalendario e : eventos) {
                if (e.cubre(dia)) {
                    int pct = e.getPorcentajeSugerido() != null ? e.getPorcentajeSugerido() : porTipo(e.getTipo(), reglas);
                    porcentaje = Math.max(porcentaje, pct);
                    nombres.add(e.getNombre());
                    motivos.add(e.getNombre() + " (+" + pct + " %)");
                }
            }
            if (ocupacion >= reglas.umbralOcupacionAlta()) {
                porcentaje += reglas.aumentoOcupacionAlta();
                motivos.add("ocupación prevista " + Math.round(ocupacion) + " % ≥ " + reglas.umbralOcupacionAlta()
                        + " % (+" + reglas.aumentoOcupacionAlta() + " %)");
            }
            if (porcentaje > reglas.aumentoMaximo()) {
                motivos.add("tope de +" + reglas.aumentoMaximo() + " %");
                porcentaje = reglas.aumentoMaximo();
            }
            resultado.add(new Noche(dia, porcentaje, ocupacion, nombres, motivos));
        }
        return resultado;
    }

    static int porTipo(TipoEvento tipo, ReglasTarifa reglas) {
        return switch (tipo) {
            case FERIADO_NACIONAL -> reglas.aumentoFeriado();
            case FESTIVIDAD_LOCAL -> reglas.aumentoFestividad();
            case EVENTO -> reglas.aumentoEvento();
            case TEMPORADA_ALTA -> reglas.aumentoTemporadaAlta();
        };
    }

    /** Agrupa noches seguidas con el mismo % (> 0) y los mismos eventos. */
    static List<List<Noche>> agrupar(List<Noche> noches) {
        List<List<Noche>> grupos = new ArrayList<>();
        List<Noche> actual = new ArrayList<>();
        for (Noche n : noches) {
            boolean continua = !actual.isEmpty()
                    && actual.get(actual.size() - 1).fecha().plusDays(1).equals(n.fecha())
                    && actual.get(0).porcentaje() == n.porcentaje()
                    && actual.get(0).eventos().equals(n.eventos());
            if (!continua && !actual.isEmpty()) {
                grupos.add(actual);
                actual = new ArrayList<>();
            }
            if (n.porcentaje() > 0) {
                actual.add(n);
            } else if (!actual.isEmpty()) {
                grupos.add(actual);
                actual = new ArrayList<>();
            }
        }
        if (!actual.isEmpty()) {
            grupos.add(actual);
        }
        return grupos;
    }

    /** La IA redacta la justificación con el historial; si no hay IA, se usa el texto de reglas. */
    private void justificar(RecomendacionTarifa rec) {
        String reglas = "Se sugiere subir " + rec.getPorcentaje() + " % la tarifa base del " + rec.getFechaInicio()
                + " al " + rec.getFechaFin() + ". Motivo: " + rec.getMotivo()
                + ". Ocupación prevista: " + rec.getOcupacionPrevista() + " %.";

        String historial = recomendacionRepository
                .findTop10ByEstadoInOrderByFechaDecisionDesc(List.of(EstadoRecomendacion.APROBADA, EstadoRecomendacion.RECHAZADA))
                .stream()
                .map(h -> "- " + h.getFechaInicio() + " a " + h.getFechaFin() + ": +" + h.getPorcentaje() + " % "
                        + h.getEstado() + (h.getComentarioDecision() != null ? " (\"" + h.getComentarioDecision() + "\")" : "")
                        + (h.getOcupacionReal() != null ? ", ocupación real " + h.getOcupacionReal() + " %" : ""))
                .collect(Collectors.joining("\n"));

        String instruccion = "Eres analista de ingresos (revenue management) de un hotel en Ica, Perú. "
                + "Escribe en español, en 3 oraciones como máximo, una justificación clara para que el administrador "
                + "decida si aprueba la subida. Usa solo los datos entregados; menciona decisiones pasadas parecidas "
                + "si las hay. No cambies el porcentaje.";
        String pedido = "Recomendación: +" + rec.getPorcentaje() + " % del " + rec.getFechaInicio() + " al " + rec.getFechaFin()
                + ".\nEventos: " + (rec.getEventos().isBlank() ? "ninguno" : rec.getEventos())
                + "\nMotivos calculados: " + rec.getMotivo()
                + "\nOcupación prevista: " + rec.getOcupacionPrevista() + " %"
                + "\nHistorial de decisiones recientes:\n" + (historial.isBlank() ? "(sin decisiones previas)" : historial);

        clienteIA.completar(instruccion, pedido).ifPresentOrElse(texto -> {
            rec.setJustificacion(texto);
            rec.setFuente("IA");
        }, () -> {
            rec.setJustificacion(reglas);
            rec.setFuente("REGLAS");
        });
    }

    // ==================== DECISIÓN DEL ADMINISTRADOR ====================

    @Transactional
    public RecomendacionTarifa decidir(Long id, boolean aprobar, Integer porcentajeAjustado, String comentario, String usuario) {
        RecomendacionTarifa rec = recomendacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recomendación", "id", id));
        if (rec.getEstado() != EstadoRecomendacion.PENDIENTE) {
            throw new BadRequestException("La recomendación ya fue " + rec.getEstado().name().toLowerCase());
        }
        if (aprobar && rec.getFechaFin().isBefore(LocalDate.now())) {
            throw new BadRequestException("Las fechas de la recomendación ya pasaron");
        }
        rec.setEstado(aprobar ? EstadoRecomendacion.APROBADA : EstadoRecomendacion.RECHAZADA);
        rec.setComentarioDecision(comentario);
        rec.setDecididoPor(usuario);
        rec.setFechaDecision(LocalDateTime.now());

        if (aprobar) {
            int maximo = configuracionService.reglasTarifa().aumentoMaximo();
            int pct = porcentajeAjustado != null ? porcentajeAjustado : rec.getPorcentaje();
            if (pct < 0 || pct > maximo) {
                throw new BadRequestException("El porcentaje debe estar entre 0 y " + maximo + " %");
            }
            rec.setPorcentajeAplicado(pct);
            tarifaRepository.save(TarifaTemporada.builder()
                    .nombre("Recomendación #" + rec.getId() + (rec.getEventos() != null && !rec.getEventos().isBlank()
                            ? " · " + rec.getEventos() : " · ocupación alta"))
                    .fechaInicio(rec.getFechaInicio())
                    .fechaFin(rec.getFechaFin())
                    .porcentaje(pct)
                    .activa(true)
                    .recomendacionId(rec.getId())
                    .creadoPor(usuario)
                    .build());
        }
        return recomendacionRepository.save(rec);
    }

    // ==================== HISTORIAL ====================

    /** Historial completo; a las recomendaciones cuyo periodo ya pasó se les calcula la ocupación real. */
    @Transactional
    public List<RecomendacionTarifa> historial() {
        marcarVencidas();
        List<RecomendacionTarifa> todas = recomendacionRepository.findAllByOrderByFechaCreacionDesc();
        LocalDate hoy = LocalDate.now();
        for (RecomendacionTarifa r : todas) {
            if (r.getOcupacionReal() == null && r.getFechaFin().isBefore(hoy)
                    && r.getEstado() != EstadoRecomendacion.VENCIDA) {
                r.setOcupacionReal(ocupacionReal(r.getFechaInicio(), r.getFechaFin()));
                recomendacionRepository.save(r);
            }
        }
        return todas;
    }

    @Transactional
    public List<RecomendacionTarifa> pendientes() {
        marcarVencidas();
        return recomendacionRepository.findByEstadoOrderByFechaInicioAsc(EstadoRecomendacion.PENDIENTE);
    }

    /** Pendientes cuyas fechas ya empezaron: ya no tiene sentido decidirlas. */
    private void marcarVencidas() {
        LocalDate hoy = LocalDate.now();
        for (RecomendacionTarifa r : recomendacionRepository.findByEstadoOrderByFechaInicioAsc(EstadoRecomendacion.PENDIENTE)) {
            if (r.getFechaInicio().isBefore(hoy)) {
                r.setEstado(EstadoRecomendacion.VENCIDA);
                recomendacionRepository.save(r);
            }
        }
    }

    /** Ocupación real promedio: estadías que realmente ocuparon cada noche del periodo. */
    private Double ocupacionReal(LocalDate desde, LocalDate hasta) {
        long habitaciones = habitacionRepository.count();
        if (habitaciones == 0) {
            return 0.0;
        }
        List<Estadia> estadias = estadiaRepository.findAll().stream()
                .filter(e -> e.getEstado() != EstadoEstadia.CANCELADA)
                .toList();
        double suma = 0;
        int noches = 0;
        for (LocalDate d = desde; !d.isAfter(hasta); d = d.plusDays(1)) {
            final LocalDate dia = d;
            long ocupadas = estadias.stream().filter(e -> {
                LocalDate entrada = e.getFechaIngreso().toLocalDate();
                LocalDate salida = e.getFechaSalidaReal() != null ? e.getFechaSalidaReal().toLocalDate() : e.getFechaSalidaEsperada();
                return !dia.isBefore(entrada) && dia.isBefore(salida);
            }).count();
            suma += Math.min(100.0, ocupadas * 100.0 / habitaciones);
            noches++;
        }
        return redondear(noches > 0 ? suma / noches : 0);
    }

    private static double redondear(double valor) {
        return Math.round(valor * 10.0) / 10.0;
    }
}
