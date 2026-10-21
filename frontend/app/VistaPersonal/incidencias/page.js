'use client';

import React, { useEffect, useState } from 'react';
import { Wrench, RefreshCw } from 'lucide-react';
import { IncidenciasAPI, HabitacionAPI } from '../../../lib/api';
import { useToast } from '../../components/Toast';

// Historial de incidencias de mantenimiento por habitación (RF-08).

const COLOR = {
  ABIERTA: 'bg-rose-100 text-rose-800',
  EN_ATENCION: 'bg-amber-100 text-amber-800',
  RESUELTA: 'bg-emerald-100 text-emerald-800'
};
const campo = 'w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500';

export default function IncidenciasPage() {
  const { addToast } = useToast();
  const [incidencias, setIncidencias] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [filtroHab, setFiltroHab] = useState('');
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({ habitacionId: '', descripcion: '', prioridad: 'MEDIA', bloqueaHabitacion: false });

  const cargar = async (habId = filtroHab) => {
    setCargando(true);
    try {
      setIncidencias((await IncidenciasAPI.listar(habId || null)) || []);
    } catch (err) {
      addToast(err.message || 'No se pudieron cargar las incidencias', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    HabitacionAPI.getAll().then(h => setHabitaciones(h || [])).catch(() => {});
    cargar('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reportar = async (e) => {
    e.preventDefault();
    try {
      await IncidenciasAPI.reportar({ ...form, habitacionId: Number(form.habitacionId) });
      addToast('Incidencia registrada y avisada al personal', 'success');
      setForm({ habitacionId: '', descripcion: '', prioridad: 'MEDIA', bloqueaHabitacion: false });
      cargar();
    } catch (err) {
      addToast(err.message || 'No se pudo registrar', 'error');
    }
  };

  const atender = async (id) => {
    try {
      await IncidenciasAPI.atender(id);
      cargar();
    } catch (err) {
      addToast(err.message || 'No se pudo actualizar', 'error');
    }
  };

  const resolver = async (id) => {
    const solucion = window.prompt('¿Qué se hizo para resolverla?') || '';
    try {
      await IncidenciasAPI.resolver(id, solucion);
      addToast('Incidencia resuelta', 'success');
      cargar();
    } catch (err) {
      addToast(err.message || 'No se pudo resolver', 'error');
    }
  };

  const abiertas = incidencias.filter(i => i.estado !== 'RESUELTA').length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950"><Wrench className="w-6 h-6" /></div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Incidencias de mantenimiento</h1>
            <p className="text-xs text-slate-500">{abiertas} abiertas. Las graves bloquean la habitación hasta resolverse.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select value={filtroHab} onChange={e => { setFiltroHab(e.target.value); cargar(e.target.value); }}
            className="p-2 rounded-xl border border-slate-300 text-xs bg-white" aria-label="Filtrar por habitación">
            <option value="">Todas las habitaciones</option>
            {habitaciones.map(h => <option key={h.id} value={h.id}>Habitación {h.numero}</option>)}
          </select>
          <button type="button" onClick={() => cargar()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
      </header>

      <form onSubmit={reportar} className="p-4 rounded-2xl border border-slate-200 bg-white grid md:grid-cols-6 gap-2 items-end">
        <select required value={form.habitacionId} onChange={e => setForm({ ...form, habitacionId: e.target.value })} className={campo} aria-label="Habitación">
          <option value="">Habitación…</option>
          {habitaciones.map(h => <option key={h.id} value={h.id}>{h.numero} · {h.estado}</option>)}
        </select>
        <input required maxLength={500} placeholder="Ej.: no enfría el aire acondicionado" value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })} className={`${campo} md:col-span-3`} />
        <select value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value })} className={campo} aria-label="Prioridad">
          {['BAJA', 'MEDIA', 'ALTA', 'URGENTE'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
            <input type="checkbox" checked={form.bloqueaHabitacion} onChange={e => setForm({ ...form, bloqueaHabitacion: e.target.checked })} />
            Bloquear
          </label>
          <button type="submit" className="flex-1 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">Reportar</button>
        </div>
      </form>

      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Fecha</th><th className="p-3 text-left">Hab.</th><th className="p-3 text-left">Incidencia</th>
              <th className="p-3 text-left">Prioridad</th><th className="p-3 text-left">Estado</th><th className="p-3 text-left">Solución</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {incidencias.map(i => (
              <tr key={i.id} className="border-t border-slate-100 align-top">
                <td className="p-3 whitespace-nowrap">{String(i.fechaReporte || '').replace('T', ' ').slice(0, 16)}<br /><span className="text-slate-500">{i.reportadoPor}</span></td>
                <td className="p-3 font-semibold">{i.habitacion?.numero}</td>
                <td className="p-3">{i.descripcion}{i.bloqueaHabitacion ? <span className="block text-rose-700 font-semibold">Bloquea la habitación</span> : null}</td>
                <td className="p-3">{i.prioridad}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${COLOR[i.estado]}`}>{i.estado}</span></td>
                <td className="p-3 text-slate-600">{i.solucion || '—'}</td>
                <td className="p-3 text-right whitespace-nowrap space-x-2">
                  {i.estado === 'ABIERTA' && <button type="button" onClick={() => atender(i.id)} className="text-[11px] font-semibold text-amber-700 hover:underline">Atender</button>}
                  {i.estado !== 'RESUELTA' && <button type="button" onClick={() => resolver(i.id)} className="text-[11px] font-semibold text-emerald-700 hover:underline">Resolver</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
