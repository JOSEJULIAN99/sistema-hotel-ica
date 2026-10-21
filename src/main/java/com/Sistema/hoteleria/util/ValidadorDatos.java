package com.Sistema.hoteleria.util;

import com.Sistema.hoteleria.exception.DatosInvalidosException;
import com.Sistema.hoteleria.model.enums.TipoDocumento;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Reglas de validación de los datos de huéspedes y reservas. Son las mismas que aplica
 * el formulario web (frontend/lib/validaciones.js), pero aquí son las que valen:
 * el servidor nunca confía en lo que valida el navegador.
 */
public final class ValidadorDatos {

    public static final int MAX_NOCHES_WEB = 30;
    public static final int MAX_DIAS_ANTICIPACION = 365;
    public static final int MAX_OBSERVACIONES = 300;
    private static final ZoneId LIMA = ZoneId.of("America/Lima");

    private static final Pattern NOMBRE = Pattern.compile("^[\\p{L}][\\p{L} '´.-]{1,79}$");
    private static final Pattern P_DNI = Pattern.compile("^\\d{8}$");
    private static final Pattern P_CARNET = Pattern.compile("^[A-Z0-9]{9,12}$");
    private static final Pattern P_PASAPORTE = Pattern.compile("^[A-Z0-9]{6,12}$");
    private static final Pattern P_RUC = Pattern.compile("^(10|15|17|20)\\d{9}$");
    private static final Pattern CELULAR_PERU = Pattern.compile("^9\\d{8}$");
    private static final Pattern TELEFONO_INTERNACIONAL = Pattern.compile("^\\+\\d{8,15}$");
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");

    private ValidadorDatos() { }

    /** Acumula los errores de varios campos y los lanza juntos. */
    public static final class Errores {
        private final Map<String, String> errores = new LinkedHashMap<>();

        public Errores agregar(String campo, String mensaje) {
            if (mensaje != null) errores.putIfAbsent(campo, mensaje);
            return this;
        }

        public void lanzarSiHay() {
            if (!errores.isEmpty()) throw new DatosInvalidosException(errores);
        }
    }

    public static Errores errores() {
        return new Errores();
    }

    public static String nombre(String valor, String etiqueta) {
        if (valor == null || valor.isBlank()) return "Ingrese " + etiqueta;
        return NOMBRE.matcher(valor.trim()).matches() ? null
                : "Los " + etiqueta + " solo pueden tener letras y espacios (2 a 80 caracteres)";
    }

    public static String documento(TipoDocumento tipo, String numero) {
        if (tipo == null) return "Seleccione el tipo de documento";
        if (numero == null || numero.isBlank()) return "Ingrese el número de documento";
        String n = numero.trim().toUpperCase();
        return switch (tipo) {
            case DNI -> P_DNI.matcher(n).matches() ? null : "El DNI debe tener 8 dígitos";
            case CARNET_EXTRANJERIA -> P_CARNET.matcher(n).matches() ? null : "El carné de extranjería tiene de 9 a 12 letras o números";
            case PASAPORTE -> P_PASAPORTE.matcher(n).matches() ? null : "El pasaporte tiene de 6 a 12 letras o números, sin espacios";
            case RUC -> P_RUC.matcher(n).matches() ? null : "El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20";
        };
    }

    /** Teléfono opcional: celular peruano de 9 dígitos que empieza con 9, o internacional con +código. */
    public static String telefono(String valor) {
        if (valor == null || valor.isBlank()) return null;
        String t = valor.replaceAll("[\\s-]", "");
        return CELULAR_PERU.matcher(t).matches() || TELEFONO_INTERNACIONAL.matcher(t).matches() ? null
                : "Ingrese un celular de 9 dígitos que empiece con 9, o un número internacional con + y código de país";
    }

    public static String email(String valor) {
        if (valor == null || valor.isBlank()) return null;
        return EMAIL.matcher(valor.trim()).matches() ? null : "El correo no es válido";
    }

    public static String password(String valor) {
        if (valor == null || valor.length() < 8) return "La contraseña debe tener al menos 8 caracteres";
        boolean letra = valor.chars().anyMatch(Character::isLetter);
        boolean numero = valor.chars().anyMatch(Character::isDigit);
        return letra && numero ? null : "La contraseña debe combinar letras y números";
    }

    /** Reglas de una reserva hecha por un cliente desde la web. */
    public static void estanciaWeb(LocalDate entrada, LocalDate salida, Integer personas, String observaciones) {
        Errores e = errores();
        LocalDate hoy = LocalDate.now(LIMA);
        if (entrada == null) {
            e.agregar("fechaEntrada", "Seleccione la fecha de llegada");
        } else if (entrada.isBefore(hoy)) {
            e.agregar("fechaEntrada", "La fecha de llegada no puede ser anterior a hoy");
        } else if (entrada.isAfter(hoy.plusDays(MAX_DIAS_ANTICIPACION))) {
            e.agregar("fechaEntrada", "Se puede reservar con hasta un año de anticipación");
        }
        if (salida == null) {
            e.agregar("fechaSalida", "Seleccione la fecha de salida");
        } else if (entrada != null && !salida.isAfter(entrada)) {
            e.agregar("fechaSalida", "La salida debe ser al menos un día después de la llegada");
        } else if (entrada != null && ChronoUnit.DAYS.between(entrada, salida) > MAX_NOCHES_WEB) {
            e.agregar("fechaSalida", "Las reservas en línea son de máximo " + MAX_NOCHES_WEB + " noches; para más, contacte al hotel");
        }
        if (personas == null || personas < 1) {
            e.agregar("numeroPersonas", "Indique cuántas personas se alojarán");
        }
        if (observaciones != null && observaciones.length() > MAX_OBSERVACIONES) {
            e.agregar("observaciones", "Los pedidos especiales no pueden superar " + MAX_OBSERVACIONES + " caracteres");
        }
        e.lanzarSiHay();
    }
}
