package com.Sistema.hoteleria.service.monitoreo;

import com.Sistema.hoteleria.model.enums.EstadoIncidencia;
import com.Sistema.hoteleria.model.enums.EstadoPagoOnline;
import com.Sistema.hoteleria.model.enums.EstadoRecomendacion;
import com.Sistema.hoteleria.repository.AvisoRepository;
import com.Sistema.hoteleria.repository.IncidenciaRepository;
import com.Sistema.hoteleria.repository.PagoOnlineRepository;
import com.Sistema.hoteleria.repository.RecomendacionTarifaRepository;
import com.Sistema.hoteleria.repository.RegistroActividadRepository;
import com.Sistema.hoteleria.service.DashboardService;
import com.Sistema.hoteleria.service.avisos.CanalAvisos;
import com.Sistema.hoteleria.service.ia.ClienteModeloIA;
import com.Sistema.hoteleria.service.pagos.MercadoPagoService;
import com.Sistema.hoteleria.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Panel de monitoreo del administrador (RF-15): servicios, operación, actividad y errores. */
@Service
@RequiredArgsConstructor
public class MonitoreoService {

    private final JdbcTemplate jdbcTemplate;
    private final ClienteModeloIA clienteIA;
    private final StorageService storageService;
    private final MercadoPagoService mercadoPagoService;
    private final CanalAvisos canalAvisos;
    private final DashboardService dashboardService;
    private final RegistroActividadRepository actividadRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final PagoOnlineRepository pagoOnlineRepository;
    private final RecomendacionTarifaRepository recomendacionRepository;
    private final AvisoRepository avisoRepository;

    @Value("${app.monitoreo.dias-actividad:90}")
    private int diasActividad;

    @Transactional(readOnly = true)
    public Map<String, Object> resumen() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("generado", LocalDateTime.now());
        r.put("servicios", servicios());
        r.put("operacion", operacion());

        LocalDateTime hace24h = LocalDateTime.now().minusHours(24);
        Map<String, Object> actividad = new LinkedHashMap<>();
        actividad.put("operaciones24h", actividadRepository.countByFechaAfter(hace24h));
        actividad.put("erroresServidor24h", actividadRepository.countByEstadoHttpGreaterThanEqualAndFechaAfter(500, hace24h));
        actividad.put("rechazos24h", actividadRepository.countByEstadoHttpBetweenAndFechaAfter(400, 499, hace24h));
        actividad.put("ultimas", actividadRepository.findTop40ByOrderByFechaDesc());
        actividad.put("ultimosErrores", actividadRepository.findTop15ByEstadoHttpGreaterThanEqualAndFechaAfterOrderByFechaDesc(400, hace24h));
        r.put("actividad", actividad);

        Runtime rt = Runtime.getRuntime();
        Map<String, Object> servidor = new LinkedHashMap<>();
        servidor.put("encendidoMinutos", ManagementFactory.getRuntimeMXBean().getUptime() / 60000);
        servidor.put("memoriaUsadaMb", (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024));
        servidor.put("memoriaMaximaMb", rt.maxMemory() / (1024 * 1024));
        servidor.put("java", System.getProperty("java.version"));
        servidor.put("procesadores", rt.availableProcessors());
        r.put("servidor", servidor);
        return r;
    }

    private List<Map<String, Object>> servicios() {
        // Base de datos: consulta mínima y su latencia
        Map<String, Object> bd = servicio("Base de datos");
        long inicio = System.currentTimeMillis();
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            bd.put("estado", "OK");
            bd.put("latenciaMs", System.currentTimeMillis() - inicio);
            bd.put("detalle", "PostgreSQL respondiendo");
        } catch (Exception e) {
            bd.put("estado", "ERROR");
            bd.put("detalle", "Sin conexión a la base de datos");
        }

        Map<String, Object> ia = servicio("IA generativa (Llama)");
        if (!clienteIA.habilitado()) {
            ia.put("estado", "DESACTIVADO");
            ia.put("detalle", "Sin IA: chatbot y asistente responden con reglas");
        } else {
            ia.put("estado", clienteIA.getUltimoError() == null ? "OK" : "ALERTA");
            ia.put("latenciaMs", clienteIA.getUltimaLatenciaMs() >= 0 ? clienteIA.getUltimaLatenciaMs() : null);
            ia.put("detalle", clienteIA.getProveedor() + " · " + clienteIA.getModelo() + " · " + clienteIA.getLlamadasOk()
                    + " respuestas, " + clienteIA.getLlamadasError() + " fallos"
                    + (clienteIA.getUltimoError() != null ? " · último error: " + clienteIA.getUltimoError() : ""));
        }

        Map<String, Object> archivos = servicio("Almacenamiento de fotos");
        archivos.put("estado", storageService.configurado() ? "OK" : "ERROR");
        archivos.put("detalle", "supabase".equals(storageService.tipo()) ? "Supabase Storage" : "Disco del servidor (sin Supabase)");

        Map<String, Object> mp = servicio("Mercado Pago");
        if (!mercadoPagoService.configurado()) {
            mp.put("estado", "DESACTIVADO");
            mp.put("detalle", "Sin credenciales: cobro solo en recepción");
        } else {
            mp.put("estado", "OK");
            mp.put("detalle", mercadoPagoService.modoPrueba() ? "Modo prueba (sandbox)" : "Producción");
        }

        Map<String, Object> avisos = servicio("Avisos en tiempo real");
        avisos.put("estado", "OK");
        avisos.put("detalle", canalAvisos.conectados() + " pantallas conectadas");

        return List.of(bd, ia, archivos, mp, avisos);
    }

    private static Map<String, Object> servicio(String nombre) {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("nombre", nombre);
        return s;
    }

    private Map<String, Object> operacion() {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("indicadores", dashboardService.obtenerEstadisticas());
        o.put("incidenciasAbiertas", incidenciaRepository.countByEstadoIn(List.of(EstadoIncidencia.ABIERTA, EstadoIncidencia.EN_ATENCION)));
        o.put("pagosOnlinePendientes", pagoOnlineRepository.countByEstado(EstadoPagoOnline.PENDIENTE));
        o.put("pagosOnlineAprobados", pagoOnlineRepository.countByEstado(EstadoPagoOnline.APROBADO));
        o.put("tarifasPorDecidir", recomendacionRepository.countByEstado(EstadoRecomendacion.PENDIENTE));
        o.put("avisosHoy", avisoRepository.countByFechaAfter(LocalDate.now().atStartOfDay()));
        return o;
    }

    /** Limpia el registro de actividad antiguo todos los días a las 03:00. */
    @Scheduled(cron = "0 0 3 * * *", zone = "America/Lima")
    @Transactional
    public void limpiarActividadAntigua() {
        actividadRepository.borrarAnterioresA(LocalDateTime.now().minusDays(diasActividad));
    }
}
