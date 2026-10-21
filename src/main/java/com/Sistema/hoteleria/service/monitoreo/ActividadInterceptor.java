package com.Sistema.hoteleria.service.monitoreo;

import com.Sistema.hoteleria.model.entity.RegistroActividad;
import com.Sistema.hoteleria.repository.RegistroActividadRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

/** Registra las operaciones de escritura y los errores del API para el panel de monitoreo. */
@Slf4j
@Component
@RequiredArgsConstructor
public class ActividadInterceptor implements HandlerInterceptor {

    private static final String INICIO = ActividadInterceptor.class.getName() + ".inicio";

    private final RegistroActividadRepository repository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(INICIO, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String ruta = request.getRequestURI();
        if (!ruta.startsWith("/api/") || ruta.startsWith("/api/avisos/stream")) {
            return;
        }
        int estado = response.getStatus();
        boolean escritura = !"GET".equals(request.getMethod()) && !"OPTIONS".equals(request.getMethod());
        if (!escritura && estado < 400) {
            return; // las consultas exitosas no se registran
        }
        try {
            Object inicio = request.getAttribute(INICIO);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String usuario = auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName()) ? auth.getName() : "anónimo";
            String rol = auth != null ? auth.getAuthorities().stream().map(a -> a.getAuthority().replace("ROLE_", ""))
                    .findFirst().orElse(null) : null;
            repository.save(RegistroActividad.builder()
                    .fecha(LocalDateTime.now())
                    .usuario(usuario)
                    .rol(rol)
                    .metodo(request.getMethod())
                    .ruta(ruta.length() > 255 ? ruta.substring(0, 255) : ruta)
                    .estadoHttp(estado)
                    .duracionMs(inicio instanceof Long l ? System.currentTimeMillis() - l : null)
                    .ip(request.getRemoteAddr())
                    .build());
        } catch (Exception e) {
            log.debug("No se pudo registrar la actividad: {}", e.getMessage());
        }
    }
}
