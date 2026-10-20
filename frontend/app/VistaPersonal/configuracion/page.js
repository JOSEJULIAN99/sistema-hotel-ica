'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, Info } from 'lucide-react';
import { ConfiguracionAPI } from '../../../lib/api';
import { useToast } from '../../components/Toast';

// Base de conocimiento de la IA: lo que aquí escribe el administrador es lo único que la IA sabe del hotel.

const CAMPOS_CORTOS = [
  { clave: 'nombreHotel', etiqueta: 'Nombre del hotel', requerido: true },
  { clave: 'direccion', etiqueta: 'Dirección' },
  { clave: 'telefono', etiqueta: 'Teléfono de recepción' },
  { clave: 'email', etiqueta: 'Correo de reservas' },
  { clave: 'horaCheckIn', etiqueta: 'Check-in desde (hh:mm)' },
  { clave: 'horaCheckOut', etiqueta: 'Check-out hasta (hh:mm)' }
];

const REGLAS_TARIFA = [
  { clave: 'umbralOcupacionAlta', etiqueta: 'Ocupación alta desde (%)' },
  { clave: 'aumentoOcupacionAlta', etiqueta: 'Aumento por ocupación alta (%)' },
  { clave: 'aumentoFeriado', etiqueta: 'Aumento en feriado nacional (%)' },
  { clave: 'aumentoFestividad', etiqueta: 'Aumento en festividad de Ica (%)' },
  { clave: 'aumentoEvento', etiqueta: 'Aumento por evento (%)' },
  { clave: 'aumentoTemporadaAlta', etiqueta: 'Aumento en temporada alta (%)' },
  { clave: 'aumentoMaximo', etiqueta: 'Tope máximo de aumento (%)' },
  { clave: 'horizonteDias', etiqueta: 'Días a analizar hacia adelante' }
];

const BLOQUES = [
  { clave: 'descripcion', etiqueta: 'Descripción del hotel', ayuda: 'Cómo presentaría el hotel a un turista.' },
  { clave: 'servicios', etiqueta: 'Servicios', ayuda: 'Piscina, desayuno, wifi, horarios, traslados y costos adicionales.' },
  { clave: 'politicas', etiqueta: 'Políticas', ayuda: 'Cancelación, menores, mascotas, formas de pago, documentos.' },
  { clave: 'turismo', etiqueta: 'Recomendaciones turísticas de Ica', ayuda: 'Lugares, horarios recomendados y consejos para el huésped.' },
  { clave: 'reglasAsistente', etiqueta: 'Reglas para la IA', ayuda: 'Tono, temas que debe evitar y cuándo derivar a recepción.' }
];

export default function ConfiguracionPage() {
  const { addToast } = useToast();
  const [datos, setDatos] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ConfiguracionAPI.obtener()
      .then(setDatos)
      .catch(err => setError(err.message || 'No se pudo cargar la configuración'));
  }, []);

  const cambiar = (clave, valor) => setDatos(prev => ({ ...prev, [clave]: valor }));

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const actualizado = await ConfiguracionAPI.actualizar(datos);
      setDatos(actualizado);
      addToast('Información del negocio guardada. La IA ya la usa.', 'success');
    } catch (err) {
      addToast(err.message || 'No se pudo guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const campo = 'w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500';

  if (error) return <div className="p-6 text-xs font-semibold text-rose-600">{error}</div>;
  if (!datos) return <div className="p-6 text-xs text-slate-500">Cargando configuración…</div>;

  return (
    <form onSubmit={guardar} className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950"><Settings className="w-6 h-6" /></div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Configuración del negocio e IA</h1>
            <p className="text-xs text-slate-500">
              Información y reglas del negocio que usan el chatbot, el traductor y el asistente.
            </p>
          </div>
        </div>
        <button type="submit" disabled={guardando}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-60">
          <Save className="w-4 h-4" /> {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </header>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Los textos vienen con información por defecto: revíselos y complete el teléfono y la dirección.
          La IA no inventa datos: si algo no está aquí, deriva al huésped a recepción.
        </span>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-5 grid md:grid-cols-3 gap-4">
        {CAMPOS_CORTOS.map(c => (
          <label key={c.clave} className="text-xs font-semibold text-slate-700 space-y-1">
            <span>{c.etiqueta}</span>
            <input value={datos[c.clave] || ''} required={c.requerido}
              onChange={e => cambiar(c.clave, e.target.value)} className={campo} />
          </label>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        {BLOQUES.map(b => (
          <label key={b.clave} className="bg-white rounded-2xl border border-slate-200 p-5 text-xs font-semibold text-slate-700 space-y-2 block">
            <span className="block text-sm font-bold text-slate-900">{b.etiqueta}</span>
            <span className="block font-normal text-slate-500">{b.ayuda}</span>
            <textarea rows={6} maxLength={4000} value={datos[b.clave] || ''}
              onChange={e => cambiar(b.clave, e.target.value)} className={campo} />
            <span className="block text-right font-normal text-slate-400">{(datos[b.clave] || '').length} / 4000</span>
          </label>
        ))}
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Reglas de tarifas dinámicas</h2>
          <p className="text-xs text-slate-500">
            El motor suma el aumento del evento y el de ocupación alta, sin pasar el tope. Cada subida espera su aprobación en Tarifas dinámicas.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REGLAS_TARIFA.map(r => (
            <label key={r.clave} className="text-xs font-semibold text-slate-700 space-y-1">
              <span>{r.etiqueta}</span>
              <input type="number" min={r.clave === 'horizonteDias' ? 7 : 0} max={r.clave === 'horizonteDias' ? 365 : 100}
                value={datos[r.clave] ?? ''} onChange={e => cambiar(r.clave, e.target.value === '' ? null : Number(e.target.value))}
                className={campo} />
            </label>
          ))}
        </div>
      </section>

      {datos.updatedAt && (
        <p className="text-[11px] text-slate-500">
          Última actualización: {String(datos.updatedAt).replace('T', ' ').slice(0, 16)} por {datos.actualizadoPor}
        </p>
      )}
    </form>
  );
}
