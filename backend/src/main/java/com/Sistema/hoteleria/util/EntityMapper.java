package com.Sistema.hoteleria.util;

import com.Sistema.hoteleria.dto.*;
import com.Sistema.hoteleria.model.entity.*;

import java.util.stream.Collectors;

public class EntityMapper {

    public static HabitacionDTO toHabitacionDTO(Habitacion h) {
        if (h == null) return null;
        return HabitacionDTO.builder()
                .id(h.getId())
                .numero(h.getNumero())
                .piso(h.getPiso())
                .tipo(h.getTipo())
                .precioPorNoche(h.getPrecioPorNoche())
                .capacidad(h.getCapacidad())
                .estado(h.getEstado())
                .descripcion(h.getDescripcion())
                .caracteristicas(h.getCaracteristicas())
                .imagenUrl(h.getImagenUrl())
                .build();
    }

    public static HuespedDTO toHuespedDTO(Huesped h) {
        if (h == null) return null;
        return HuespedDTO.builder()
                .id(h.getId())
                .nombres(h.getNombres())
                .apellidos(h.getApellidos())
                .tipoDocumento(h.getTipoDocumento())
                .numeroDocumento(h.getNumeroDocumento())
                .telefono(h.getTelefono())
                .email(h.getEmail())
                .nacionalidad(h.getNacionalidad())
                .ciudadProcedencia(h.getCiudadProcedencia())
                .build();
    }

    public static UsuarioDTO toUsuarioDTO(Usuario u) {
        if (u == null) return null;
        return UsuarioDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .nombreCompleto(u.getNombreCompleto())
                .email(u.getEmail())
                .telefono(u.getTelefono())
                .rol(u.getRol())
                .turno(u.getTurno())
                .activo(u.getActivo())
                .build();
    }

    public static ReservacionDTO toReservacionDTO(Reservacion r) {
        if (r == null) return null;
        return ReservacionDTO.builder()
                .id(r.getId())
                .codigoReserva(r.getCodigoReserva())
                .huesped(toHuespedDTO(r.getHuesped()))
                .habitacion(toHabitacionDTO(r.getHabitacion()))
                .fechaEntrada(r.getFechaEntrada())
                .fechaSalida(r.getFechaSalida())
                .numeroPersonas(r.getNumeroPersonas())
                .precioTotal(r.getPrecioTotal())
                .adelanto(r.getAdelanto())
                .estado(r.getEstado())
                .observaciones(r.getObservaciones())
                .createdAt(r.getCreatedAt())
                .build();
    }

    public static ConsumoDTO toConsumoDTO(ConsumoServicio c) {
        if (c == null) return null;
        return ConsumoDTO.builder()
                .id(c.getId())
                .estadiaId(c.getEstadia() != null ? c.getEstadia().getId() : null)
                .nombreServicio(c.getNombreServicio())
                .cantidad(c.getCantidad())
                .precioUnitario(c.getPrecioUnitario())
                .subtotal(c.getSubtotal())
                .fechaConsumo(c.getFechaConsumo())
                .build();
    }

    public static PagoDTO toPagoDTO(Pago p) {
        if (p == null) return null;
        return PagoDTO.builder()
                .id(p.getId())
                .estadiaId(p.getEstadia() != null ? p.getEstadia().getId() : null)
                .monto(p.getMonto())
                .metodoPago(p.getMetodoPago())
                .fechaPago(p.getFechaPago())
                .nroOperacion(p.getNroOperacion())
                .tipoComprobante(p.getTipoComprobante())
                .nroComprobante(p.getNroComprobante())
                .notas(p.getNotas())
                .build();
    }

    public static EstadiaDTO toEstadiaDTO(Estadia e) {
        if (e == null) return null;
        return EstadiaDTO.builder()
                .id(e.getId())
                .reservacionId(e.getReservacion() != null ? e.getReservacion().getId() : null)
                .codigoReserva(e.getReservacion() != null ? e.getReservacion().getCodigoReserva() : null)
                .huesped(toHuespedDTO(e.getHuesped()))
                .habitacion(toHabitacionDTO(e.getHabitacion()))
                .fechaIngreso(e.getFechaIngreso())
                .fechaSalidaEsperada(e.getFechaSalidaEsperada())
                .fechaSalidaReal(e.getFechaSalidaReal())
                .totalHospedaje(e.getTotalHospedaje())
                .totalConsumos(e.getTotalConsumos())
                .descuento(e.getDescuento())
                .totalPagar(e.getTotalPagar())
                .totalPagado(e.getTotalPagado())
                .saldoPendiente(e.getSaldoPendiente())
                .estado(e.getEstado())
                .observaciones(e.getObservaciones())
                .consumos(e.getConsumos() != null ? e.getConsumos().stream().map(EntityMapper::toConsumoDTO).collect(Collectors.toList()) : null)
                .pagos(e.getPagos() != null ? e.getPagos().stream().map(EntityMapper::toPagoDTO).collect(Collectors.toList()) : null)
                .build();
    }

    public static TareaLimpiezaDTO toTareaLimpiezaDTO(TareaLimpieza t) {
        if (t == null) return null;
        return TareaLimpiezaDTO.builder()
                .id(t.getId())
                .habitacion(toHabitacionDTO(t.getHabitacion()))
                .empleadoAsignado(toUsuarioDTO(t.getEmpleadoAsignado()))
                .tipoLimpieza(t.getTipoLimpieza())
                .estado(t.getEstado())
                .prioridad(t.getPrioridad())
                .observaciones(t.getObservaciones())
                .fechaCreacion(t.getFechaCreacion())
                .fechaInicio(t.getFechaInicio())
                .fechaFin(t.getFechaFin())
                .build();
    }
}
