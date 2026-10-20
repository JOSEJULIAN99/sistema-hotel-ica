package com.Sistema.hoteleria.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lee el encabezado "Authorization: Bearer <token>" y, si el token es válido,
 * registra al usuario autenticado con su rol (ROLE_ADMINISTRADOR, ROLE_RECEPCIONISTA, ...).
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";
    private static final String RUTA_STREAM = "/api/avisos/stream";

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = null;
        if (header != null && header.startsWith(PREFIJO)) {
            token = header.substring(PREFIJO.length());
        } else if (RUTA_STREAM.equals(request.getRequestURI())) {
            // EventSource (avisos en tiempo real) no permite encabezados: el token llega en ?token=
            token = request.getParameter("token");
        }
        if (token != null && !token.isBlank() && SecurityContextHolder.getContext().getAuthentication() == null) {
            jwtService.validar(token).ifPresent(claims -> autenticar(claims, request));
        }
        chain.doFilter(request, response);
    }

    private void autenticar(Claims claims, HttpServletRequest request) {
        String rol = claims.get("rol", String.class);
        if (rol == null) {
            return;
        }
        var auth = new UsernamePasswordAuthenticationToken(
                claims.getSubject(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + rol)));
        auth.setDetails(request.getRemoteAddr());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
