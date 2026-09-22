'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Bed,
  DollarSign,
  Users,
  FileText,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  UserPlus,
  Search
} from 'lucide-react';
import { useToast } from './Toast';
import { HuespedAPI } from '../../lib/api';

export default function ModalReserva({
  isOpen,
  onClose,
  onSave,
  habitacionPreseleccionada = null,
  habitaciones = [],
  huespedes = []
}) {
  const { addToast } = useToast();

  // Modo: 'NUEVO' (ingresar datos desde cero) o 'EXISTENTE' (seleccionar de lista)
  const [modoHuesped, setModoHuesped] = useState('NUEVO');

  // Datos del Huésped a ingresar
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [ciudadProcedencia, setCiudadProcedencia] = useState('');
  const [huespedIdExistente, setHuespedIdExistente] = useState('');

  // Datos de la Reserva
  const [habitacionId, setHabitacionId] = useState('');
  const [fechaEntrada, setFechaEntrada] = useState(() => new Date().toISOString().split('T')[0]);
  const [fechaSalida, setFechaSalida] = useState(() => new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [numeroPersonas, setNumeroPersonas] = useState(2);
  const [adelanto, setAdelanto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset y sincronización al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (habitacionPreseleccionada) {
        setHabitacionId(habitacionPreseleccionada.id);
      } else if (habitaciones.length > 0 && !habitacionId) {
        setHabitacionId(habitaciones[0].id);
      }
      // Limpiar campos de nuevo huésped para ingresar desde cero
      setNombres('');
      setApellidos('');
      setNumeroDocumento('');
      setTelefono('');
      setEmail('');
      setCiudadProcedencia('');
      setAdelanto('');
      setObservaciones('');
      setModoHuesped('NUEVO');
    }
  }, [isOpen, habitacionPreseleccionada, habitaciones]);

  if (!isOpen) return null;

  const habSeleccionada = habitaciones.find(h => String(h.id) === String(habitacionId)) || habitacionPreseleccionada;
  const diffDays = Math.max(1, Math.ceil((new Date(fechaSalida) - new Date(fechaEntrada)) / (1000 * 60 * 60 * 24)));
  const precioNoche = habSeleccionada ? Number(habSeleccionada.precioPorNoche) : 120;
  const precioSugerido = precioNoche * diffDays;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!habitacionId) {
      addToast('Por favor selecciona una habitación', 'error');
      return;
    }

    setLoading(true);
    try {
      let finalHuespedId = huespedIdExistente;

      // Si ingresa datos de nuevo huésped, registrarlo primero
      if (modoHuesped === 'NUEVO') {
        if (!nombres.trim() || !apellidos.trim() || !numeroDocumento.trim()) {
          throw new Error('Por favor ingresa Nombres, Apellidos y Número de Documento del Huésped');
        }

        const nuevoHuesped = await HuespedAPI.create({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          tipoDocumento,
          numeroDocumento: numeroDocumento.trim(),
          telefono: telefono.trim() || null,
          email: email.trim() || null,
          nacionalidad: 'Peruana',
          ciudadProcedencia: ciudadProcedencia.trim() || 'Ica'
        });

        finalHuespedId = nuevoHuesped.id;
      }

      if (!finalHuespedId) {
        throw new Error('No se pudo determinar el huésped para la reservación');
      }

      const payload = {
        huespedId: Number(finalHuespedId),
        habitacionId: Number(habitacionId),
        fechaEntrada,
        fechaSalida,
        numeroPersonas: Number(numeroPersonas),
        precioTotal: Number(precioSugerido),
        adelanto: adelanto ? Number(adelanto) : 0,
        observaciones: observaciones.trim()
      };

      await onSave(payload);
      addToast('¡Reservación registrada exitosamente!', 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Error al procesar la reservación', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">Nueva Reservación</h3>
              <p className="text-[11px] text-amber-400 font-medium">Hotel Princes Ica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* SECCIÓN 1: DATOS DEL HUÉSPED */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" /> Datos del Huésped
              </span>

              {huespedes && huespedes.length > 0 && (
                <div className="inline-flex p-0.5 bg-slate-200 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setModoHuesped('NUEVO')}
                    className={`px-2.5 py-1 rounded-md font-bold transition ${
                      modoHuesped === 'NUEVO' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Nuevo
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoHuesped('EXISTENTE')}
                    className={`px-2.5 py-1 rounded-md font-bold transition ${
                      modoHuesped === 'EXISTENTE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Buscar Registrado
                  </button>
                </div>
              )}
            </div>

            {modoHuesped === 'NUEVO' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      placeholder="Ej: Carlos Alberto"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      placeholder="Ej: Mendoza Salazar"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento</label>
                    <select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="DNI">DNI (Documento Nacional)</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Número de Documento *</label>
                    <input
                      type="text"
                      required
                      value={numeroDocumento}
                      onChange={(e) => setNumeroDocumento(e.target.value)}
                      placeholder="Ej: 48920145"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: 987654321"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ej: cliente@correo.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Selecciona Huésped Registrado</label>
                <select
                  value={huespedIdExistente}
                  onChange={(e) => setHuespedIdExistente(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required={modoHuesped === 'EXISTENTE'}
                >
                  <option value="">-- Seleccionar de la lista --</option>
                  {huespedes.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nombres} {h.apellidos} ({h.tipoDocumento}: {h.numeroDocumento})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: HABITACIÓN Y DETALLES DE RESERVA */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <Bed className="w-4 h-4 text-amber-500" /> Habitación & Estadía
            </span>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Habitación a Reservar *</label>
              <select
                value={habitacionId}
                onChange={(e) => setHabitacionId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                {habitaciones.map((h) => (
                  <option key={h.id} value={h.id}>
                    Habitación {h.numero} • {h.tipo} (Piso {h.piso}) — S/ {Number(h.precioPorNoche).toFixed(2)}/noche [{h.estado}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha de Llegada</label>
                <input
                  type="date"
                  required
                  value={fechaEntrada}
                  onChange={(e) => setFechaEntrada(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha de Salida</label>
                <input
                  type="date"
                  required
                  value={fechaSalida}
                  min={fechaEntrada}
                  onChange={(e) => setFechaSalida(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cant. Huéspedes</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={numeroPersonas}
                  onChange={(e) => setNumeroPersonas(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adelanto (Opcional)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={adelanto}
                  onChange={(e) => setAdelanto(e.target.value)}
                  placeholder="S/ 0.00"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peticiones Especiales / Observaciones</label>
              <textarea
                rows="2"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Llegada de noche, requiere cuna o toallas extra..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* RESUMEN DE TARIFA */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-800 font-semibold block">Total Calculado</span>
              <span className="text-xs text-amber-700">
                {diffDays} noche{diffDays > 1 ? 's' : ''} x S/ {precioNoche.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-amber-950 font-mono">
                S/ {precioSugerido.toFixed(2)}
              </span>
              {adelanto > 0 && (
                <span className="block text-[10px] text-amber-700 font-semibold">
                  Saldo pendiente: S/ {(precioSugerido - Number(adelanto)).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Guardando...' : 'Confirmar Reservación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
