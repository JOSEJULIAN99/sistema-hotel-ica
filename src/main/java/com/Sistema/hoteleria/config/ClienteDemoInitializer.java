package com.Sistema.hoteleria.config;

import com.Sistema.hoteleria.model.entity.Huesped;
import com.Sistema.hoteleria.model.entity.Usuario;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.model.enums.TipoDocumento;
import com.Sistema.hoteleria.repository.HuespedRepository;
import com.Sistema.hoteleria.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crea una cuenta de cliente de demostración (cliente@demo.com / cliente123) si aún no existe ningún cliente.
 * Se desactiva con APP_CLIENTE_DEMO=false antes de producción.
 */
@Component
@Order(20)
@RequiredArgsConstructor
@Slf4j
public class ClienteDemoInitializer implements CommandLineRunner {

    static final String EMAIL_DEMO = "cliente@demo.com";
    private static final String DNI_DEMO = "70123457";

    private final UsuarioRepository usuarioRepository;
    private final HuespedRepository huespedRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.cliente-demo:true}")
    private boolean habilitado;

    @Override
    @Transactional
    public void run(String... args) {
        if (!habilitado || usuarioRepository.existsByRol(RolUsuario.CLIENTE) || usuarioRepository.existsByUsername(EMAIL_DEMO)) {
            return;
        }
        Huesped huesped = huespedRepository.findByNumeroDocumento(DNI_DEMO)
                .filter(h -> !usuarioRepository.existsByHuespedId(h.getId()))
                .orElseGet(() -> huespedRepository.save(Huesped.builder()
                        .nombres("Lucía")
                        .apellidos("Ramos Torres")
                        .tipoDocumento(TipoDocumento.DNI)
                        .numeroDocumento(DNI_DEMO)
                        .telefono("987654321")
                        .email(EMAIL_DEMO)
                        .nacionalidad("Peruana")
                        .ciudadProcedencia("Lima")
                        .build()));
        usuarioRepository.save(Usuario.builder()
                .username(EMAIL_DEMO)
                .password(passwordEncoder.encode("cliente123"))
                .nombreCompleto(huesped.getNombreCompleto().trim())
                .email(EMAIL_DEMO)
                .telefono(huesped.getTelefono())
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .huesped(huesped)
                .build());
        log.info("Cuenta de cliente de demostración creada: {} / cliente123", EMAIL_DEMO);
    }
}
