'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, CalendarDays, Users, CheckCircle2, CreditCard, Lock, User, BedDouble } from 'lucide-react';
import { ClienteAPI } from '../../../lib/cliente';
import { cotizarEstancia } from '../../../lib/api';
import * as V from '../../../lib/validaciones';

const IMAGEN_POR_DEFECTO = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=70';

export const hoyISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const sumarDias = (iso, dias) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
};

// Reserva desde la web: solo para clientes con cuenta. Sus datos de huésped salen de su perfil.
export default function ReservaClienteModal({ abierto, onCerrar, habitacion, entradaInicial, salidaInicial, personasIniciales = 1, onReservada }) {
  const [cliente, setCliente] = useState(null);
  const [entrada, setEntrada] = useState(entradaInicial || hoyISO());
  const [salida, setSalida] = useState(salidaInicial || sumarDias(hoyISO(), 1));
  const [personas, setPersonas] = useState(personasIniciales);
  const [observaciones, setObservaciones] = useState('');
  const [cotizacion, setCotizacion] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [erroresServidor, setErroresServidor] = useState({});
  const [reserva, setReserva] = useState(null);
  const [pagando, setPagando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setCliente(ClienteAPI.getCliente());
    setEntrada(entradaInicial || hoyISO());
    setSalida(salidaInicial || sumarDias(entradaInicial || hoyISO(), 1));
    setPersonas(Math.min(Number(personasIniciales) || 1, habitacion?.capacidad || 1));
    setObservaciones('');
    setError('');
    setErroresServidor({});
    setReserva(null);
  }, [abierto, habitacion, entradaInicial, salidaInicial, personasIniciales]);

  // Precio real del servidor (incluye tarifas de temporada aprobadas)
  useEffect(() => {
    let vigente = true;
    setCotizacion(null);
    if (abierto && habitacion && entrada && salida && salida > entrada) {
      cotizarEstancia(habitacion.id, entrada, salida)
        .then((c) => { if (vigente) setCotizacion(c); })
        .catch(() => { /* sin cotización se muestra el cálculo base */ });
    }
    return () => { vigente = false; };
  }, [abierto, habitacion, entrada, salida]);

  if (!abierto || !habitacion) return null;

  const noches = salida > entrada ? Math.round((new Date(salida) - new Date(entrada)) / 86400000) : 0;
  const precioNoche = Number(habitacion.precioPorNoche || 0);
  const total = cotizacion ? Number(cotizacion.total) : precioNoche * noches;
  const ajuste = cotizacion ? Number(cotizacion.ajusteTemporada || 0) : 0;
  // Validación en vivo (mismas reglas que el servidor) + errores que devolvió el servidor por campo
  const erroresVivos = V.estancia({
    fechaEntrada: entrada,
    fechaSalida: salida,
    numeroPersonas: personas,
    capacidad: habitacion.capacidad,
    observaciones
  });
  const errores = { ...erroresServidor, ...erroresVivos };
  const hayErrores = Object.keys(erroresVivos).length > 0;
  const volver = `/?hab=${habitacion.id}&entrada=${entrada}&salida=${salida}&personas=${personas}`;

  const confirmar = async (e) => {
    e.preventDefault();
    setError('');
    setErroresServidor({});
    if (hayErrores) {
      setError('Revise los datos marcados.');
      return;
    }
    setEnviando(true);
    try {
      const r = await ClienteAPI.reservar({
        habitacionId: habitacion.id,
        fechaEntrada: entrada,
        fechaSalida: salida,
        numeroPersonas: Number(personas),
        observaciones: observaciones.trim() || null
      });
      setReserva(r);
      if (onReservada) onReservada(r);
    } catch (err) {
      if (err.status === 401) setCliente(null);
      if (err.campos) setErroresServidor(err.campos);
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const pagarAhora = async () => {
    setPagando(true);
    try {
      const pago = await ClienteAPI.pagar(reserva.codigoReserva);
      if (pago?.urlPago) {
        window.location.href = pago.urlPago;
        return;
      }
      setError('No se recibió el enlace de pago. Puede pagar desde "Mis reservas".');
    } catch (err) {
      setError(err.message || 'El pago en línea no está disponible; puede pagar en recepción.');
    } finally {
      setPagando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 grid md:grid-cols-[0.9fr_1.1fr]">
        <button onClick={onCerrar} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 text-slate-600 hover:text-slate-900" aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-48 md:h-auto bg-slate-200">
          <img src={habitacion.imagenUrl || IMAGEN_POR_DEFECTO} alt={`Habitación ${habitacion.numero}`} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/80 to-transparent text-white">
            <p className="text-xs font-semibold text-amber-300">Habitación {habitacion.numero}</p>
            <p className="text-lg font-black">{habitacion.tipo}</p>
            <p className="text-xs text-slate-200 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Hasta {habitacion.capacidad} personas · S/ {precioNoche.toFixed(2)} por noche</p>
          </div>
        </div>

        <div className="p-6">
          {!cliente ? (
            <div className="space-y-4 py-6">
              <Lock className="w-10 h-10 text-amber-500" />
              <h3 className="text-xl font-black text-slate-900">Ingresa para reservar</h3>
              <p className="text-sm text-slate-600">
                Las reservas en línea se hacen con tu cuenta: así guardamos tus datos una sola vez y puedes ver y pagar tus reservas cuando quieras.
              </p>
              <div className="flex flex-col gap-2">
                <Link href={`/cuenta?volver=${encodeURIComponent(volver)}`} className="py-3 rounded-xl bg-slate-900 text-white text-sm font-bold text-center">Ingresar</Link>
                <Link href={`/cuenta?modo=registro&volver=${encodeURIComponent(volver)}`} className="py-3 rounded-xl bg-amber-400 text-slate-950 text-sm font-bold text-center">Crear cuenta gratis</Link>
              </div>
            </div>
          ) : reserva ? (
            <div className="space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <div>
                <h3 className="text-xl font-black text-slate-900">¡Reserva registrada!</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Código <span className="font-mono font-bold">{reserva.codigoReserva}</span>. Recepción la confirmará; si la pagas ahora queda confirmada al instante.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-1">
                <p className="flex justify-between"><span className="text-slate-500">Llegada</span><span className="font-semibold">{reserva.fechaEntrada}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Salida</span><span className="font-semibold">{reserva.fechaSalida}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-black">S/ {Number(reserva.precioTotal).toFixed(2)}</span></p>
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <div className="flex flex-col gap-2">
                <button onClick={pagarAhora} disabled={pagando} className="py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  <CreditCard className="w-4 h-4" /> {pagando ? 'Abriendo Mercado Pago…' : 'Pagar ahora con Mercado Pago'}
                </button>
                <Link href="/cuenta/reservas" className="py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold text-center">Pagar después en recepción · Ver mis reservas</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={confirmar} className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Completa tu reserva</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Reservando como <span className="font-semibold text-slate-700">{cliente.nombreCompleto}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="font-semibold text-slate-700 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Llegada</span>
                  <input type="date" value={entrada} min={hoyISO()} required
                    onChange={(e) => {
                      setEntrada(e.target.value);
                      if (salida <= e.target.value) setSalida(sumarDias(e.target.value, 1));
                    }}
                    className={`mt-1 w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-400 ${errores.fechaEntrada ? 'border-rose-400' : 'border-slate-300'}`} />
                  {errores.fechaEntrada && <p className="mt-1 text-xs text-rose-600">{errores.fechaEntrada}</p>}
                </label>
                <label className="block text-sm">
                  <span className="font-semibold text-slate-700 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Salida</span>
                  <input type="date" value={salida} min={sumarDias(entrada, 1)} max={sumarDias(entrada, V.MAX_NOCHES_WEB)} required onChange={(e) => setSalida(e.target.value)}
                    className={`mt-1 w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-400 ${errores.fechaSalida ? 'border-rose-400' : 'border-slate-300'}`} />
                  {errores.fechaSalida && <p className="mt-1 text-xs text-rose-600">{errores.fechaSalida}</p>}
                </label>
              </div>

              <label className="block text-sm">
                <span className="font-semibold text-slate-700 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Personas</span>
                <select value={personas} onChange={(e) => setPersonas(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {Array.from({ length: habitacion.capacidad || 1 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
                {errores.numeroPersonas && <p className="mt-1 text-xs text-rose-600">{errores.numeroPersonas}</p>}
              </label>

              <label className="block text-sm">
                <span className="font-semibold text-slate-700">Pedidos especiales (opcional)</span>
                <textarea rows={2} maxLength={300} value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: llegaré de noche, necesito cuna…"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <p className="text-right text-[11px] text-slate-400">{observaciones.length}/{V.MAX_OBSERVACIONES}</p>
              </label>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div className="text-xs text-amber-800">
                  <p className="font-semibold flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {noches} noche{noches === 1 ? '' : 's'}</p>
                  {ajuste !== 0 && <p>Incluye tarifa de temporada: {ajuste > 0 ? '+' : ''}S/ {ajuste.toFixed(2)}</p>}
                </div>
                <p className="text-2xl font-black text-amber-950">S/ {total.toFixed(2)}</p>
              </div>

              {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}

              <button type="submit" disabled={enviando || hayErrores}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition disabled:opacity-50">
                {enviando ? 'Reservando…' : 'Confirmar reserva'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
