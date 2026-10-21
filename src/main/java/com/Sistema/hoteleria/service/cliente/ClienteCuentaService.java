package com.Sistema.hoteleria.service.cliente;

import com.Sistema.hoteleria.dto.ReservacionDTO;
import com.Sistema.hoteleria.dto.ReservacionRequestDTO;
import com.Sistema.hoteleria.dto.cliente.ActualizarPerfilDTO;
import com.Sistema.hoteleria.dto.cliente.PerfilClienteDTO;
import com.Sistema.hoteleria.dto.cliente.RegistroClienteDTO;
import com.Sistema.hoteleria.dto.cliente.ReservaClienteDTO;
import com.Sistema.hoteleria.dto.cliente.SesionClienteDTO;
import com.Sistema.hoteleria.exception.BadRequestException;
import com.Sistema.hoteleria.exception.ResourceNotFoundException;
import com.Sistema.hoteleria.model.entity.Huesped;
import com.Sistema.hoteleria.model.entity.Reservacion;
import com.Sistema.hoteleria.model.entity.Usuario;
import com.Sistema.hoteleria.model.enums.EstadoReservacion;
import com.Sistema.hoteleria.model.enums.RolUsuario;
import com.Sistema.hoteleria.repository.HuespedRepository;
import com.Sistema.hoteleria.repository.ReservacionRepository;
import com.Sistema.hoteleria.repository.UsuarioRepository;
import com.Sistema.hoteleria.security.JwtService;
import com.Sistema.hoteleria.service.ReservacionService;
import com.Sistema.hoteleria.model.enums.TipoDocumento;
import com.Sistema.hoteleria.util.EntityMapper;
import com.Sistema.hoteleria.util.ValidadorDatos;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;

/**
 * Cuentas de clientes (huéspedes que reservan desde la web).
 * Son independientes del personal: tienen su propio registro, su propio ingreso
 * y solo ven sus datos y sus reservas.
 */
@Service
@RequiredArgsConstructor
public class ClienteCuentaService {

    private static final ZoneId LIMA = ZoneId.of("America/Lima");

    private final UsuarioRepository usuarioRepository;
    private final HuespedRepository huespedRepository;
    private final ReservacionRepository reservacionRepository;
    private final ReservacionService reservacionService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ==================== REGISTRO E INGRESO ====================

    @Transactional
    public SesionClienteDTO registrar(RegistroClienteDTO dto) {
        ValidadorDatos.errores()
                .agregar("nombres", ValidadorDatos.nombre(dto.getNombres(), "nombres"))
                .agregar("apellidos", ValidadorDatos.nombre(dto.getApellidos(), "apellidos"))
                .agregar("numeroDocumento", dto.getTipoDocumento() == TipoDocumento.RUC
                        ? "Para la cuenta personal use DNI, carné de extranjería o pasaporte"
                        : ValidadorDatos.documento(dto.getTipoDocumento(), dto.getNumeroDocumento()))
                .agregar("email", ValidadorDatos.email(dto.getEmail()))
                .agregar("telefono", ValidadorDatos.telefono(dto.getTelefono()))
                .agregar("password", ValidadorDatos.password(dto.getPassword()))
                .lanzarSiHay();
        String email = normalizarEmail(dto.getEmail());
        if (usuarioRepository.existsByUsername(email)) {
            throw new BadRequestException("Ya existe una cuenta con el correo " + email + ". Inicie sesión.");
        }
        String documento = dto.getNumeroDocumento().trim().toUpperCase(Locale.ROOT);
        String nombres = limpiar(dto.getNombres());
        String apellidos = limpiar(dto.getApellidos());

        Huesped huesped = huespedRepository.findByNumeroDocumento(documento)
                .map(existente -> vincularHuespedExistente(existente, apellidos, email, dto))
                .orElseGet(() -> Huesped.builder()
                        .nombres(nombres)
                        .apellidos(apellidos)
                        .tipoDocumento(dto.getTipoDocumento())
                        .numeroDocumento(documento)
                        .telefono(normalizarTelefono(dto.getTelefono()))
                        .email(email)
                        .nacionalidad(vacioANull(dto.getNacionalidad()))
                        .ciudadProcedencia(vacioANull(dto.getCiudadProcedencia()))
                        .build());
        huesped = huespedRepository.save(huesped);

        Usuario cuenta = usuarioRepository.save(Usuario.builder()
                .username(email)
                .password(passwordEncoder.encode(dto.getPassword()))
                .nombreCompleto(huesped.getNombreCompleto().trim())
                .email(email)
                .telefono(huesped.getTelefono())
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .huesped(huesped)
                .build());
        return sesion(cuenta);
    }

    /**
     * Un huésped que ya se alojó (registrado por recepción) puede crear su cuenta con su documento.
     * Para que nadie tome la ficha de otra persona, los apellidos deben coincidir.
     */
    private Huesped vincularHuespedExistente(Huesped existente, String apellidos, String email, RegistroClienteDTO dto) {
        if (usuarioRepository.existsByHuespedId(existente.getId())) {
            throw new BadRequestException("El documento " + existente.getNumeroDocumento()
                    + " ya tiene una cuenta. Inicie sesión con su correo.");
        }
        if (!existente.getApellidos().trim().equalsIgnoreCase(apellidos)) {
            throw new BadRequestException("Los datos no coinciden con el documento registrado en el hotel. "
                    + "Acérquese a recepción para corregirlos.");
        }
        existente.setEmail(email);
        if (vacioANull(dto.getTelefono()) != null) existente.setTelefono(normalizarTelefono(dto.getTelefono()));
        if (vacioANull(dto.getNacionalidad()) != null) existente.setNacionalidad(dto.getNacionalidad().trim());
        if (vacioANull(dto.getCiudadProcedencia()) != null) existente.setCiudadProcedencia(dto.getCiudadProcedencia().trim());
        return existente;
    }

    @Transactional(readOnly = true)
    public SesionClienteDTO login(String emailIngresado, String password) {
        Usuario u = usuarioRepository.findByUsername(normalizarEmail(emailIngresado))
                .orElseThrow(() -> new BadRequestException("Correo o contraseña incorrectos"));
        if (password == null || u.getPassword() == null || !u.getPassword().startsWith("$2")
                || !passwordEncoder.matches(password, u.getPassword())) {
            throw new BadRequestException("Correo o contraseña incorrectos");
        }
        if (u.getRol() != RolUsuario.CLIENTE) {
            throw new BadRequestException("Esta cuenta es del personal del hotel. Ingrese por el acceso del personal.");
        }
        if (Boolean.FALSE.equals(u.getActivo())) {
            throw new BadRequestException("Su cuenta está desactivada. Comuníquese con el hotel.");
        }
        return sesion(u);
    }

    // ==================== PERFIL ====================

    @Transactional(readOnly = true)
    public PerfilClienteDTO perfil(String username) {
        return aPerfil(cuenta(username));
    }

    @Transactional
    public PerfilClienteDTO actualizarPerfil(String username, ActualizarPerfilDTO dto) {
        ValidadorDatos.errores().agregar("telefono", ValidadorDatos.telefono(dto.getTelefono())).lanzarSiHay();
        Usuario u = cuenta(username);
        Huesped h = u.getHuesped();
        h.setTelefono(normalizarTelefono(dto.getTelefono()));
        h.setNacionalidad(vacioANull(dto.getNacionalidad()));
        h.setCiudadProcedencia(vacioANull(dto.getCiudadProcedencia()));
        u.setTelefono(h.getTelefono());
        huespedRepository.save(h);
        usuarioRepository.save(u);
        return aPerfil(u);
    }

    // ==================== RESERVAS DEL CLIENTE ====================

    @Transactional(readOnly = true)
    public List<ReservacionDTO> misReservas(String username) {
        Long huespedId = cuenta(username).getHuesped().getId();
        return reservacionRepository.findByHuespedIdOrderByFechaEntradaDesc(huespedId).stream()
                .map(EntityMapper::toReservacionDTO)
                .toList();
    }

    @Transactional
    public ReservacionDTO reservar(String username, ReservaClienteDTO dto) {
        ValidadorDatos.estanciaWeb(dto.getFechaEntrada(), dto.getFechaSalida(), dto.getNumeroPersonas(), dto.getObservaciones());
        Long huespedId = cuenta(username).getHuesped().getId();
        return reservacionService.crearPendiente(ReservacionRequestDTO.builder()
                .huespedId(huespedId)
                .habitacionId(dto.getHabitacionId())
                .fechaEntrada(dto.getFechaEntrada())
                .fechaSalida(dto.getFechaSalida())
                .numeroPersonas(dto.getNumeroPersonas())
                .observaciones(vacioANull(dto.getObservaciones()))
                .build());
    }

    /** El cliente cancela su propia reserva hasta el día anterior a la llegada y si aún no pagó. */
    @Transactional
    public ReservacionDTO cancelar(String username, Long reservaId) {
        Long huespedId = cuenta(username).getHuesped().getId();
        Reservacion r = reservacionRepository.findById(reservaId)
                .filter(x -> x.getHuesped() != null && huespedId.equals(x.getHuesped().getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Reservación", "id", reservaId));
        if (r.getEstado() != EstadoReservacion.PENDIENTE && r.getEstado() != EstadoReservacion.CONFIRMADA) {
            throw new BadRequestException("La reserva " + r.getCodigoReserva() + " ya no se puede cancelar (" + r.getEstado() + ")");
        }
        if (!r.getFechaEntrada().isAfter(LocalDate.now(LIMA))) {
            throw new BadRequestException("Las reservas se cancelan hasta el día anterior a la llegada. Comuníquese con recepción.");
        }
        if (r.getAdelanto() != null && r.getAdelanto().compareTo(BigDecimal.ZERO) > 0) {
            throw new BadRequestException("La reserva tiene un pago registrado. Comuníquese con recepción para la devolución.");
        }
        return reservacionService.cancelar(reservaId, "Cancelada por el cliente desde la web");
    }

    // ==================== APOYO ====================

    private Usuario cuenta(String username) {
        Usuario u = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta", "usuario", username));
        if (u.getRol() != RolUsuario.CLIENTE || u.getHuesped() == null) {
            throw new BadRequestException("La sesión no corresponde a una cuenta de cliente");
        }
        return u;
    }

    private SesionClienteDTO sesion(Usuario u) {
        return SesionClienteDTO.builder()
                .token(jwtService.generarToken(u))
                .tipo("Bearer")
                .expiraEnMinutos(jwtService.getExpirationMinutes())
                .cliente(aPerfil(u))
                .build();
    }

    private static PerfilClienteDTO aPerfil(Usuario u) {
        Huesped h = u.getHuesped();
        return PerfilClienteDTO.builder()
                .id(u.getId())
                .email(u.getEmail())
                .nombres(h != null ? h.getNombres() : null)
                .apellidos(h != null ? h.getApellidos() : null)
                .nombreCompleto(u.getNombreCompleto())
                .tipoDocumento(h != null ? h.getTipoDocumento() : null)
                .numeroDocumento(h != null ? h.getNumeroDocumento() : null)
                .telefono(h != null ? h.getTelefono() : u.getTelefono())
                .nacionalidad(h != null ? h.getNacionalidad() : null)
                .ciudadProcedencia(h != null ? h.getCiudadProcedencia() : null)
                .rol(RolUsuario.CLIENTE.name())
                .build();
    }

    static String normalizarEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String limpiar(String texto) {
        return texto == null ? null : texto.trim().replaceAll("\\s+", " ");
    }

    private static String normalizarTelefono(String telefono) {
        return telefono == null || telefono.isBlank() ? null : telefono.replaceAll("[\\s-]", "");
    }

    private static String vacioANull(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
