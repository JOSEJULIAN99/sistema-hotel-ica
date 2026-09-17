'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Bed, DollarSign, Users, AlertCircle } from 'lucide-react';
import { useToast } from './Toast';

export default function ModalReserva({ isOpen, onClose, onSave, habitaciones = [], huespedes = [] }) {
  const { addToast } = useToast();
  const [huespedId, setHuespedId] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [fechaEntrada, setFechaEntrada] = useState(() => new Date().toISOString().split('T')[0]);
  const [fechaSalida, setFechaSalida] = useState(() => new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [numeroPersonas, setNumeroPersonas] = useState(2);
  const [adelanto, setAdelanto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (huespedes.length > 0 && !huespedId) setHuespedId(huespedes[0].id);
    if (habitaciones.length > 0 && !habitacionId) setHabitacionId(habitaciones[0].id);
  }, [huespedes, habitaciones]);

  if (!isOpen) return null;

  const habSeleccionada = habitaciones.find(h => String(h.id) === String(habitacionId));
  const diffDays = Math.max(1, Math.ceil((new Date(fechaSalida) - new Date(fechaEntrada)) / (1000 * 60 * 60 * 24)));
  const precioSugerido = habSeleccionada ? habSeleccionada.precioPorNoche * diffDays : 150 * diffDays;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!huespedId || !habitacionId) return;
    setLoading(true);

    try {
      const payload = {
        huespedId: Number(huespedId),
        habitacionId: Number(habitacionId),
        fechaEntrada,
        fechaSalida,
        numeroPersonas: Number(numeroPersonas),
        precioTotal: Number(precioSugerido),
        adelanto: adelanto ? Number(adelanto) : 0,
        observaciones
      };

      await onSave(payload);
      addToast('Reservación agendada con éxito', 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Error al crear la reservación', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Crear Nueva Reservación</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Huésped</label>
            <select
              value={huespedId}
              onChange={(e) => setHuespedId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              {huespedes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nombres} {h.apellidos} ({h.tipoDocumento}: {h.numeroDocumento})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Habitación a Reservar</label>
            <select
              value={habitacionId}
              onChange={(e) => setHabitacionId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              {habitaciones.map((h) => (
                <option key={h.id} value={h.id}>
                  Habitación {h.numero} - {h.tipo} (Piso {h.piso}) - S/ {h.precioPorNoche}/noche - [{h.estado}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha de Entrada</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Número de Personas</label>
              <input
                type="number"
                min="1"
                max={habSeleccionada?.capacidad || 4}
                required
                value={numeroPersonas}
                onChange={(e) => setNumeroPersonas(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Adelanto / Seña (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={adelanto}
                placeholder="0.00"
                onChange={(e) => setAdelanto(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-amber-900 font-bold">
            <div>
              <span className="block text-[10px] text-amber-700 uppercase">Cotización Total ({diffDays} noche{diffDays > 1 ? 's' : ''})</span>
              <span className="text-base font-mono">S/ {precioSugerido.toFixed(2)}</span>
            </div>
            {adelanto > 0 && (
              <div className="text-right">
                <span className="block text-[10px] text-amber-700 uppercase">Saldo a Pagar en Hotel</span>
                <span className="text-base font-mono text-emerald-700">S/ {(precioSugerido - Number(adelanto)).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Observaciones / Requerimientos</label>
            <textarea
              rows={2}
              value={observaciones}
              placeholder="Ej: Cuna para bebé, llegada nocturna, paquete turístico Huacachina..."
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow"
            >
              {loading ? 'Creando Reserva...' : 'Confirmar Reservación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
