'use client';

import React, { useState, useEffect } from 'react';
import { X, Bed, Sparkles, DollarSign, Users, Layers, Image as ImageIcon } from 'lucide-react';
import { useToast } from './Toast';

export default function ModalHabitacion({ isOpen, onClose, onSave, habitacion = null }) {
  const { addToast } = useToast();
  const [numero, setNumero] = useState('');
  const [piso, setPiso] = useState(1);
  const [tipo, setTipo] = useState('MATRIMONIAL');
  const [precioPorNoche, setPrecioPorNoche] = useState('');
  const [capacidad, setCapacidad] = useState(2);
  const [estado, setEstado] = useState('DISPONIBLE');
  const [descripcion, setDescripcion] = useState('');
  const [caracteristicas, setCaracteristicas] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habitacion) {
      setNumero(habitacion.numero || '');
      setPiso(habitacion.piso || 1);
      setTipo(habitacion.tipo || 'MATRIMONIAL');
      setPrecioPorNoche(habitacion.precioPorNoche || '');
      setCapacidad(habitacion.capacidad || 2);
      setEstado(habitacion.estado || 'DISPONIBLE');
      setDescripcion(habitacion.descripcion || '');
      setCaracteristicas(habitacion.caracteristicas || '');
      setImagenUrl(habitacion.imagenUrl || '');
    } else {
      setNumero('');
      setPiso(1);
      setTipo('MATRIMONIAL');
      setPrecioPorNoche('150.00');
      setCapacidad(2);
      setEstado('DISPONIBLE');
      setDescripcion('');
      setCaracteristicas('WiFi 5G, Smart TV 55", A/C, Frigobar, Ducha Caliente');
      setImagenUrl('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80');
    }
  }, [habitacion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numero || !precioPorNoche) return;
    setLoading(true);

    try {
      const payload = {
        numero,
        piso: Number(piso),
        tipo,
        precioPorNoche: Number(precioPorNoche),
        capacidad: Number(capacidad),
        estado,
        descripcion,
        caracteristicas,
        imagenUrl
      };

      await onSave(payload, habitacion?.id);
      addToast(`Habitación ${numero} ${habitacion ? 'actualizada' : 'creada'} con éxito`, 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Error al guardar habitación', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">
              {habitacion ? `Editar Habitación N° ${habitacion.numero}` : 'Nueva Habitación'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">N° de Habitación</label>
              <input
                type="text"
                required
                value={numero}
                placeholder="Ej: 104, 205..."
                onChange={(e) => setNumero(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Piso</label>
              <select
                value={piso}
                onChange={(e) => setPiso(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={1}>Piso 1 (Jardín & Piscina)</option>
                <option value={2}>Piso 2 (Vista Oasis)</option>
                <option value={3}>Piso 3 (Suites & Terrazas)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Habitación</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="INDIVIDUAL">INDIVIDUAL (1 cama)</option>
                <option value="DOBLE">DOBLE (2 camas)</option>
                <option value="MATRIMONIAL">MATRIMONIAL (Queen/King)</option>
                <option value="SUITE">SUITE (Jacuzzi & Vista)</option>
                <option value="FAMILIAR">FAMILIAR (4+ Personas)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacidad Máxima</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Precio por Noche (S/)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={precioPorNoche}
                placeholder="150.00"
                onChange={(e) => setPrecioPorNoche(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estado Inicial</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="OCUPADA">OCUPADA</option>
                <option value="RESERVADA">RESERVADA</option>
                <option value="LIMPIEZA">LIMPIEZA</option>
                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Características / Equipamiento</label>
            <input
              type="text"
              value={caracteristicas}
              placeholder="Ej: WiFi 5G, Smart TV 55', Jacuzzi, Aire Acondicionado..."
              onChange={(e) => setCaracteristicas(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Descripción Detallada</label>
            <textarea
              rows={2}
              value={descripcion}
              placeholder="Descripción para mostrar en el catálogo y portal de reservas..."
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">URL de Imagen Fotográfica</label>
            <input
              type="url"
              value={imagenUrl}
              placeholder="https://images.unsplash.com/..."
              onChange={(e) => setImagenUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-[11px]"
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
              {loading ? 'Guardando...' : habitacion ? 'Actualizar Habitación' : 'Guardar Habitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
