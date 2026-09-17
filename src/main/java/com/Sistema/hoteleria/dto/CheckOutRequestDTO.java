package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.MetodoPago;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckOutRequestDTO {

    // Pago final para liquidar saldo (si hubiese saldo pendiente)
    private BigDecimal pagoFinal;
    private MetodoPago metodoPagoFinal;
    private String nroOperacionFinal;
    private String tipoComprobante; // "BOLETA", "FACTURA"
    private String nroComprobante;

    private String observaciones;
}
