'use client';

import React, { useState, useEffect } from 'react';
import { X, BedDouble, UserPlus, DollarSign, Calendar, CreditCard, ShoppingBag, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from './Toast';

// ==================== MODAL CHECK-IN ====================
export function ModalCheckIn({ isOpen, onClose, onSuccess, habitaciones = [], huespedes = [], reservaciones = [] }) {
  const { addToast } = useToast();
  const [tipoCheckIn, setTipoCheckIn] = useState('directo'); // 'directo' | 'reserva'
  
  // Directo
  const [huespedId, setHuespedId] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [fechaSalida, setFechaSalida] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pagoInicial, setPagoInicial] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [nroOperacion, setNroOperacion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // De reserva
  const [reservacionId, setReservacionId] = useState('');
  const [loading, setLoading] = useState(false);

  // Calcular precio sugerido
  const habSeleccionada = habitaciones.find(h => String(h.id) === String(habitacionId));
  const resSeleccionada = reservaciones.find(r => String(r.id) === String(reservacionId));

  const habitacionesDisponibles = habitaciones.filter(h => h.estado === 'DISPONIBLE');
  const reservasPendientes = reservaciones.filter(r => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE');

  useEffect(() => {
    if (habitacionesDisponibles.length > 0 && !habitacionId) {
      setHabitacionId(habitacionesDisponibles[0].id);
    }
    if (huespedes.length > 0 && !huespedId) {
      setHuespedId(huespedes[0].id);
    }
    if (reservasPendientes.length > 0 && !reservacionId) {
      setReservacionId(reservasPendientes[0].id);
    }
  }, [habitaciones, huespedes, reservaciones]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload;
      if (tipoCheckIn === 'reserva') {
        if (!reservacionId) throw new Error('Selecciona una reservación');
        payload = {
          reservacionId: Number(reservacionId),
          pagoInicial: pagoInicial ? Number(pagoInicial) : undefined,
          metodoPagoInicial: metodoPago,
          nroOperacionInicial: nroOperacion || undefined,
          observaciones
        };
      } else {
        if (!habitacionId || !huespedId) throw new Error('Selecciona una habitación y un huésped');
        const noches = Math.max(1, Math.ceil((new Date(fechaSalida) - new Date()) / (1000 * 60 * 60 * 24)));
        const totalHosp = habSeleccionada ? habSeleccionada.precioPorNoche * noches : 100;

        payload = {
          huespedId: Number(huespedId),
          habitacionId: Number(habitacionId),
          fechaSalidaEsperada: fechaSalida,
          totalHospedaje: totalHosp,
          pagoInicial: pagoInicial ? Number(pagoInicial) : 0,
          metodoPagoInicial: metodoPago,
          nroOperacionInicial: nroOperacion || undefined,
          observaciones
        };
      }

      await onSuccess(payload);
      addToast('¡Check-In registrado exitosamente!', 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Error al realizar check-in', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Registrar Nuevo Check-In</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs de Origen */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setTipoCheckIn('directo')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
              tipoCheckIn === 'directo'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🛎️ Check-In Directo (Walk-In)
          </button>
          <button
            type="button"
            onClick={() => setTipoCheckIn('reserva')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
              tipoCheckIn === 'reserva'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Desde Reservación Previa
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {tipoCheckIn === 'directo' ? (
            <>
              {/* Huésped */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Huésped Titular</label>
                <select
                  value={huespedId}
                  onChange={(e) => setHuespedId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {huespedes.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nombres} {h.apellidos} - {h.tipoDocumento}: {h.numeroDocumento}
                    </option>
                  ))}
                </select>
              </div>

              {/* Habitación */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Habitación Disponible</label>
                <select
                  value={habitacionId}
                  onChange={(e) => setHabitacionId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {habitacionesDisponibles.length === 0 ? (
                    <option value="">No hay habitaciones disponibles</option>
                  ) : (
                    habitacionesDisponibles.map((h) => (
                      <option key={h.id} value={h.id}>
                        Hab. {h.numero} - Piso {h.piso} ({h.tipo}) - S/ {h.precioPorNoche}/noche
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Fecha de Salida */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha Prevista de Salida</label>
                <input
                  type="date"
                  value={fechaSalida}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFechaSalida(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* Seleccionar Reservación */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reservación Activa</label>
                <select
                  value={reservacionId}
                  onChange={(e) => setReservacionId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {reservasPendientes.length === 0 ? (
                    <option value="">No hay reservaciones pendientes para Check-In</option>
                  ) : (
                    reservasPendientes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.codigoReserva} - {r.huesped?.nombres} {r.huesped?.apellidos} (Hab. {r.habitacion?.numero})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {resSeleccionada && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1 text-[11px]">
                  <p><strong>Habitación:</strong> N° {resSeleccionada.habitacion?.numero} ({resSeleccionada.habitacion?.tipo})</p>
                  <p><strong>Estadía:</strong> {resSeleccionada.fechaEntrada} hasta {resSeleccionada.fechaSalida}</p>
                  <p><strong>Total Hospedaje:</strong> S/ {resSeleccionada.precioTotal} | <strong>Adelanto:</strong> S/ {resSeleccionada.adelanto || 0}</p>
                </div>
              )}
            </>
          )}

          {/* Abono / Pago Inicial Opcional */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Pago o Garantía Inicial (Opcional)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Monto a Cobrar (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pagoInicial}
                  placeholder="0.00"
                  onChange={(e) => setPagoInicial(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Método de Pago</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                </select>
              </div>
            </div>

            {pagoInicial > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">N° Operación / Referencia</label>
                <input
                  type="text"
                  value={nroOperacion}
                  placeholder="Ej: YAPE-129384 o Ref POS"
                  onChange={(e) => setNroOperacion(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Observaciones / Pedidos Especiales</label>
            <textarea
              rows={2}
              value={observaciones}
              placeholder="Ej: Cama adicional, toallas extra, late check-in..."
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Footer Botones */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (tipoCheckIn === 'directo' && habitacionesDisponibles.length === 0)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition shadow"
            >
              {loading ? 'Procesando...' : 'Confirmar Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== MODAL CONSUMO ====================
export function ModalConsumo({ isOpen, onClose, onSuccess, estadia }) {
  const { addToast } = useToast();
  const [servicio, setServicio] = useState('');
  const [servicioPredefinido, setServicioPredefinido] = useState('Pisco Sour Queirolo (Bar)|25.00');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(25.00);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (servicioPredefinido === 'custom') {
      setServicio('');
      setPrecioUnitario('');
    } else {
      const [nombre, precio] = servicioPredefinido.split('|');
      setServicio(nombre);
      setPrecioUnitario(Number(precio));
    }
  }, [servicioPredefinido]);

  if (!isOpen || !estadia) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!servicio || !precioUnitario) return;
    setLoading(true);

    try {
      await onSuccess(estadia.id, {
        nombreServicio: servicio,
        cantidad: Number(cantidad),
        precioUnitario: Number(precioUnitario)
      });
      addToast(`Consumo de "${servicio}" cargado a Habitación ${estadia.habitacion?.numero}`, 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Error al registrar consumo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalCalculado = (Number(cantidad || 0) * Number(precioUnitario || 0)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Cargar Consumo a Habitación {estadia.habitacion?.numero}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
            <p><strong>Huésped:</strong> {estadia.huesped?.nombres} {estadia.huesped?.apellidos}</p>
            <p><strong>Saldo Actual de Estadía:</strong> S/ {Number(estadia.saldoPendiente || 0).toFixed(2)}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catálogo Rápido de Servicios / Bar</label>
            <select
              value={servicioPredefinido}
              onChange={(e) => setServicioPredefinido(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Pisco Sour Queirolo (Bar)|25.00">🍸 Pisco Sour Queirolo (Bar) - S/ 25.00</option>
              <option value="Chilcano de Pisco Clásico|22.00">🍹 Chilcano de Pisco Clásico - S/ 22.00</option>
              <option value="Agua Mineral San Mateo 1L|5.00">💧 Agua Mineral San Mateo 1L - S/ 5.00</option>
              <option value="Cerveza Cusqueña 330ml|12.00">🍺 Cerveza Cusqueña 330ml - S/ 12.00</option>
              <option value="Desayuno Buffet Continental|28.00">🥐 Desayuno Buffet Continental - S/ 28.00</option>
              <option value="Servicio de Lavandería Express|35.00">🧺 Servicio de Lavandería Express - S/ 35.00</option>
              <option value="Tour Sandboarding Huacachina|60.00">🏜️ Tour Sandboarding Huacachina - S/ 60.00</option>
              <option value="custom">✍️ Otro producto / Servicio personalizado</option>
            </select>
          </div>

          {servicioPredefinido === 'custom' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Descripción del Producto / Servicio</label>
              <input
                type="text"
                required
                value={servicio}
                placeholder="Ej: Snack artesanal tejas iqueñas"
                onChange={(e) => setServicio(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                required
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Precio Unitario (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0.10"
                required
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-amber-900 font-bold">
            <span>Subtotal a Cargar:</span>
            <span className="text-base font-mono">S/ {totalCalculado}</span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow"
            >
              {loading ? 'Cargando...' : 'Añadir a la Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== MODAL PAGO ====================
export function ModalPago({ isOpen, onClose, onSuccess, estadia }) {
  const { addToast } = useToast();
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('YAPE');
  const [nroOperacion, setNroOperacion] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('BOLETA');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (estadia) {
      setMonto(estadia.saldoPendiente > 0 ? estadia.saldoPendiente : '');
    }
  }, [estadia]);

  if (!isOpen || !estadia) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!monto || Number(monto) <= 0) return;
    setLoading(true);

    try {
      await onSuccess(estadia.id, {
        monto: Number(monto),
        metodoPago,
        nroOperacion: nroOperacion || `OP-${Date.now().toString().slice(-4)}`,
        tipoComprobante,
        notas
      });
      addToast(`Abono de S/ ${Number(monto).toFixed(2)} registrado correctamente`, 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Error al registrar pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Registrar Abono / Pago - Hab. {estadia.habitacion?.numero}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-emerald-900">
            <div>
              <span className="text-[10px] font-bold uppercase block text-emerald-700">Saldo Pendiente</span>
              <span className="text-base font-black font-mono">S/ {Number(estadia.saldoPendiente || 0).toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase block text-emerald-700">Total Cuenta</span>
              <span className="text-sm font-semibold font-mono">S/ {Number(estadia.totalPagar || 0).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Monto a Abonar (S/)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={monto}
              placeholder="0.00"
              onChange={(e) => setMonto(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medio de Pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="YAPE">📱 Yape</option>
                <option value="PLIN">📱 Plin</option>
                <option value="EFECTIVO">💵 Efectivo</option>
                <option value="TARJETA_CREDITO">💳 Tarjeta de Crédito</option>
                <option value="TARJETA_DEBITO">💳 Tarjeta de Débito</option>
                <option value="TRANSFERENCIA">🏦 Transferencia BCP/BBVA</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Comprobante</label>
              <select
                value={tipoComprobante}
                onChange={(e) => setTipoComprobante(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BOLETA">Boleta</option>
                <option value="FACTURA">Factura</option>
                <option value="RECIBO_INTERNO">Recibo de Caja</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">N° Operación / Código de Aprobación</label>
            <input
              type="text"
              value={nroOperacion}
              placeholder="Ej: 839201"
              onChange={(e) => setNroOperacion(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nota o Detalle</label>
            <input
              type="text"
              value={notas}
              placeholder="Ej: Pago parcial por consumos del bar"
              onChange={(e) => setNotas(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow"
            >
              {loading ? 'Guardando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== MODAL CHECK-OUT ====================
export function ModalCheckOut({ isOpen, onClose, onConfirmCheckOut, estadia }) {
  const { addToast } = useToast();
  const [pagoFinal, setPagoFinal] = useState('');
  const [metodoPagoFinal, setMetodoPagoFinal] = useState('EFECTIVO');
  const [nroOperacion, setNroOperacion] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('BOLETA');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (estadia) {
      setPagoFinal(estadia.saldoPendiente > 0 ? estadia.saldoPendiente : '0.00');
    }
  }, [estadia]);

  if (!isOpen || !estadia) return null;

  const saldo = Number(estadia.saldoPendiente || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await onConfirmCheckOut(estadia.id, {
        pagoFinal: pagoFinal ? Number(pagoFinal) : 0,
        metodoPagoFinal,
        nroOperacionFinal: nroOperacion || `OP-CHECKOUT-${Date.now().toString().slice(-4)}`,
        tipoComprobante
      });
      addToast(`Check-out de Habitación ${estadia.habitacion?.numero} realizado con éxito`, 'success');
      onClose(response);
    } catch (err) {
      addToast(err.message || 'Error al completar check-out', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-rose-900 text-white">
          <div className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-rose-300" />
            <h3 className="font-bold text-base">Check-Out & Cierre de Habitación {estadia.habitacion?.numero}</h3>
          </div>
          <button onClick={() => onClose(null)} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Resumen de Cuenta */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
              Resumen Final de Estadía
            </h4>
            <div className="flex justify-between text-slate-600">
              <span>Huésped:</span>
              <span className="font-semibold text-slate-900">{estadia.huesped?.nombres} {estadia.huesped?.apellidos}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Hospedaje:</span>
              <span className="font-mono font-medium text-slate-900">S/ {Number(estadia.totalHospedaje || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Consumos ({estadia.consumos?.length || 0}):</span>
              <span className="font-mono font-medium text-slate-900">S/ {Number(estadia.totalConsumos || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Abonado Previsto:</span>
              <span className="font-mono font-medium text-emerald-600">S/ {Number(estadia.totalPagado || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-slate-300 pt-2 text-slate-900">
              <span>Saldo Pendiente a Cobrar:</span>
              <span className={`font-mono ${saldo > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                S/ {saldo.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Si hay saldo, liquidación */}
          {saldo > 0 ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Liquidar saldo restante en caja</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Monto a Liquidar (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pagoFinal}
                    onChange={(e) => setPagoFinal(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Método de Pago</label>
                  <select
                    value={metodoPagoFinal}
                    onChange={(e) => setMetodoPagoFinal(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="EFECTIVO">💵 Efectivo</option>
                    <option value="YAPE">📱 Yape</option>
                    <option value="PLIN">📱 Plin</option>
                    <option value="TARJETA_CREDITO">💳 Tarjeta de Crédito</option>
                    <option value="TARJETA_DEBITO">💳 Tarjeta de Débito</option>
                    <option value="TRANSFERENCIA">🏦 Transferencia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Comprobante de Salida</label>
                <select
                  value={tipoComprobante}
                  onChange={(e) => setTipoComprobante(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="BOLETA">Boleta de Venta Electrónica</option>
                  <option value="FACTURA">Factura Electrónica</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>La cuenta está totalmente saldada. La habitación pasará automáticamente a estado <strong>LIMPIEZA</strong>.</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow"
            >
              {loading ? 'Liquidando...' : 'Completar Check-Out y Emitir Boleta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
