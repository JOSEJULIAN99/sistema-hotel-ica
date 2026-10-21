package com.Sistema.hoteleria.exception;

import java.util.LinkedHashMap;
import java.util.Map;

/** Error de validación con el mensaje de cada campo, para mostrarlo junto al campo en el formulario. */
public class DatosInvalidosException extends BadRequestException {

    private final Map<String, String> errores;

    public DatosInvalidosException(Map<String, String> errores) {
        super(errores.isEmpty() ? "Datos inválidos" : String.join(". ", errores.values()));
        this.errores = new LinkedHashMap<>(errores);
    }

    public Map<String, String> getErrores() {
        return errores;
    }
}
