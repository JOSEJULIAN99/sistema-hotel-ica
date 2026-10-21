package com.Sistema.hoteleria.config;

import com.Sistema.hoteleria.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Seguridad del API: sesión sin estado con JWT y permisos por rol.
 * Roles: ADMINISTRADOR, GERENTE, RECEPCIONISTA, LIMPIEZA.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String ADMIN = "ADMINISTRADOR";
    private static final String GERENTE = "GERENTE";
    private static final String RECEPCION = "RECEPCIONISTA";
    private static final String LIMPIEZA = "LIMPIEZA";

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) ->
                                escribirError(res, HttpServletResponse.SC_UNAUTHORIZED, "Debe iniciar sesión para continuar"))
                        .accessDeniedHandler((req, res, ex) ->
                                escribirError(res, HttpServletResponse.SC_FORBIDDEN, "Su rol no tiene permiso para esta operación")))
                .authorizeHttpRequests(auth -> auth
                        // Público
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/login", "/api/usuarios/registro").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/habitaciones", "/api/habitaciones/**").permitAll()
                        .requestMatchers("/api/publico/**").permitAll()

                        // Usuarios: lectura para supervisores, escritura solo administrador
                        .requestMatchers(HttpMethod.GET, "/api/usuarios", "/api/usuarios/**").hasAnyRole(ADMIN, GERENTE, RECEPCION)
                        .requestMatchers("/api/usuarios/**").hasRole(ADMIN)

                        // Habitaciones: cambio de estado operativo y mantenimiento del catálogo
                        .requestMatchers(HttpMethod.PATCH, "/api/habitaciones/*/estado").hasAnyRole(ADMIN, RECEPCION)
                        .requestMatchers("/api/habitaciones/**").hasRole(ADMIN)

                        // Caja: eliminar pagos solo administrador
                        .requestMatchers(HttpMethod.DELETE, "/api/pagos/**").hasRole(ADMIN)
                        .requestMatchers("/api/pagos/**").hasAnyRole(ADMIN, GERENTE, RECEPCION)

                        // Operación de recepción
                        .requestMatchers("/api/huespedes/**", "/api/reservaciones/**",
                                "/api/estadias/**", "/api/consumos/**", "/api/dashboard/**")
                        .hasAnyRole(ADMIN, GERENTE, RECEPCION)

                        // Limpieza: todo el personal operativo
                        .requestMatchers("/api/limpieza/**").hasAnyRole(ADMIN, GERENTE, RECEPCION, LIMPIEZA)

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static void escribirError(HttpServletResponse res, int status, String mensaje) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"success\":false,\"status\":" + status + ",\"message\":\"" + mensaje + "\"}");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
