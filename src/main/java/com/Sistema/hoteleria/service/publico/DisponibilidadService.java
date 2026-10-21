package com.Sistema.hoteleria.service.publico;

import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.model.entity.Habitacion;
import com.Sistema.hoteleria.model.entity.TarifaTemporada;
import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import com.Sistema.hoteleria.model.enums.EstadoHabitacion;
import com.Sistema.hoteleria.repository.EstadiaRepository;
import com.Sistema.hoteleria.repository.HabitacionRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.repository.TarifaTemporadaRepository;
import com.Sistema.hoteleria.service.tarifas.CalculadoraTarifa;
import com.Sistema.hoteleria.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Disponibilidad real por fechas para la web pública: una habitación está libre si no está en
 * mantenimiento, no tiene una estadía activa que siga ocupándola y no tiene reservas que se crucen.
 * Usa las mismas reglas que el servidor aplica al reservar, así la web no ofrece lo que luego se rechaza.
 */
@Service
@RequiredArgsConstructor
public class DisponibilidadService {

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final int MAX_NOCHES = 30;

    private final HabitacionRepository habitacionRepository;
    private final ReservacionRepository reservacionRepository;
    private final EstadiaRepository estadiaRepository;
    private final TarifaTemporadaRepository tarifaRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> consultar(LocalDate entrada, LocalDate salida, int personas) {
        if (entrada.isBefore(LocalDate.now(LIMA))) {
            throw new BadRequestException("La fecha de llegada no puede ser anterior a hoy");
        }
        if (!salida.isAfter(entrada)) {
            throw new BadRequestException("La fecha de salida debe ser posterior a la de llegada");
        }
        long noches = ChronoUnit.DAYS.between(entrada, salida);
        if (noches > MAX_NOCHES) {
            throw new BadRequestException("Las reservas en línea son de máximo " + MAX_NOCHES + " noches");
        }
        List<TarifaTemporada> tarifas = tarifaRepository.findActivasEnRango(entrada, salida);

        return habitacionRepository.findAll().stream()
                .sorted(Comparator.comparing(Habitacion::getPrecioPorNoche).thenComparing(Habitacion::getNumero))
                .map(h -> {
                    String motivo = motivoNoDisponible(h, entrada, salida, personas);
                    BigDecimal total = CalculadoraTarifa.total(h.getPrecioPorNoche(), h.getTipo(), entrada, salida, tarifas);
                    BigDecimal base = h.getPrecioPorNoche().multiply(BigDecimal.valueOf(noches));
                    Map<String, Object> fila = new LinkedHashMap<>();
                    fila.put("habitacion", EntityMapper.toHabitacionDTO(h));
                    fila.put("disponible", motivo == null);
                    fila.put("motivo", motivo);
                    fila.put("noches", noches);
                    fila.put("total", total);
                    fila.put("ajusteTemporada", total.subtract(base));
                    return fila;
                })
                .toList();
    }

    private String motivoNoDisponible(Habitacion h, LocalDate entrada, LocalDate salida, int personas) {
        if (h.getEstado() == EstadoHabitacion.MANTENIMIENTO) {
            return "En mantenimiento";
        }
        if (personas > h.getCapacidad()) {
            return "Capacidad máxima " + h.getCapacidad() + " personas";
        }
        boolean ocupada = estadiaRepository.findByHabitacionIdAndEstado(h.getId(), EstadoEstadia.ACTIVA)
                .filter(e -> e.getFechaSalidaEsperada() != null && e.getFechaSalidaEsperada().isAfter(entrada))
                .isPresent();
        if (ocupada || reservacionRepository.contarReservasSolapadas(h.getId(), entrada, salida) > 0) {
            return "Ocupada en esas fechas";
        }
        return null;
    }
}
