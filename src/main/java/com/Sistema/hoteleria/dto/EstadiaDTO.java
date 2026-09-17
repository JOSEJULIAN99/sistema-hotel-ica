package com.Sistema.hoteleria.dto;

import com.Sistema.hoteleria.model.enums.EstadoEstadia;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadiaDTO {
    private Long id;
    private Long reservacionId;
    private String codigoReserva;
    private HuespedDTO huesped;
    private HabitacionDTO habitacion;
    private LocalDateTime fechaIngreso;
    private LocalDate fechaSalidaEsperada;
    private LocalDateTime fechaSalidaReal;
    private BigDecimal totalHospedaje;
    private BigDecimal totalConsumos;
    private BigDecimal descuento;
    private BigDecimal totalPagar;
    private BigDecimal totalPagado;
    private BigDecimal saldoPendiente;
    private EstadoEstadia estado;
    private String observaciones;
    private List<ConsumoDTO> consumos;
    private List<PagoDTO> pagos;
}
