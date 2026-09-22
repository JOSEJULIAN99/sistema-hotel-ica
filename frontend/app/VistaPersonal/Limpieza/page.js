'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  User,
  BedDouble,
  AlertTriangle,
  Play,
  CheckCircle,
  X,
  Filter
} from 'lucide-react';
import { LimpiezaAPI, HabitacionAPI, UsuarioAPI } from '../../../lib/api';
import { useToast } from '../../components/Toast';

export default function LimpiezaPage() {
  const { addToast } = useToast();
  const [tareas, setTareas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  // Modal Nueva Tarea
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevaHabId, setNuevaHabId] = useState('');
  const [nuevoEmpleadoId, setNuevoEmpleadoId] = useState('');
  const [tipoLimpieza, setTipoLimpieza] = useState('CHECKOUT');
  const [prioridad, setPrioridad] = useState('ALTA');
  const [observaciones, setObservaciones] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, h, u] = await Promise.all([
        LimpiezaAPI.getAll(),
        HabitacionAPI.getAll(),
        UsuarioAPI.getAll()
      ]);
      setTareas(t || []);
      setHabitaciones(h || []);
      setPersonal(u || []);

      if (h?.length > 0) setNuevaHabId(h[0].id);
      if (u?.length > 0) setNuevoEmpleadoId(u[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIniciar = async (id) => {
    try {
      await LimpiezaAPI.iniciar(id);
      addToast('Limpieza iniciada en la habitación', 'success');
      loadData();
    } catch (err) {
      addToast('Error al iniciar limpieza', 'error');
    }
  };

  const handleCompletar = async (id) => {
    try {
      await LimpiezaAPI.completar(id);
      addToast('¡Limpieza completada! La habitación ahora está DISPONIBLE.', 'success');
      loadData();
    } catch (err) {
      addToast('Error al completar tarea', 'error');
    }
  };

  const handleAsignar = async (id, empId) => {
    try {
      await LimpiezaAPI.asignarEmpleado(id, empId);
      addToast('Personal asignado a la tarea', 'success');
      loadData();
    } catch (err) {
      addToast('Error al asignar personal', 'error');
    }
  };

  const handleCrearTarea = async (e) => {
    e.preventDefault();
    try {
      await LimpiezaAPI.create({
        habitacionId: Number(nuevaHabId),
        empleadoId: nuevoEmpleadoId ? Number(nuevoEmpleadoId) : undefined,
        tipoLimpieza,
        prioridad,
        observaciones
      });
      addToast('Orden de limpieza creada exitosamente', 'success');
      setModalOpen(false);
      setObservaciones('');
      loadData();
    } catch (err) {
      addToast(err.message || 'Error al crear tarea', 'error');
    }
  };

  // Filtrado
  const tareasFiltradas = tareas.filter((t) => {
    if (filtroEstado === 'PENDIENTES') return t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO';
    if (filtroEstado === 'COMPLETADAS') return t.estado === 'COMPLETADA';
    return true;
  });

  const getPrioridadBadge = (p) => {
    switch (p) {
      case 'URGENTE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">🔥 URGENTE</span>;
      case 'ALTA':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⚡ ALTA</span>;
      case 'MEDIA':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">MEDIA</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">BAJA</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Limpieza, Aseo & Mantenimiento
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Asignación de habitaciones a camareras, flujo de desinfección y liberación a estado disponible.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Programar Limpieza
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-2xl border border-slate-200">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-2">
          <Filter className="w-4 h-4" /> Filtrar:
        </span>
        <button
          onClick={() => setFiltroEstado('TODOS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filtroEstado === 'TODOS' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas ({tareas.length})
        </button>
        <button
          onClick={() => setFiltroEstado('PENDIENTES')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filtroEstado === 'PENDIENTES' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Pendientes / En Curso ({tareas.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO').length})
        </button>
        <button
          onClick={() => setFiltroEstado('COMPLETADAS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filtroEstado === 'COMPLETADAS' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Completadas ({tareas.filter(t => t.estado === 'COMPLETADA').length})
        </button>
      </div>

      {/* Listado de Tareas */}
      {tareasFiltradas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">¡Todo impecable!</h4>
          <p className="text-xs text-slate-400 mt-1">No hay tareas pendientes en este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareasFiltradas.map((tarea) => {
            const isPendiente = tarea.estado === 'PENDIENTE';
            const isEnProceso = tarea.estado === 'EN_PROCESO';
            const isCompletada = tarea.estado === 'COMPLETADA';

            let borderClass = 'border-slate-200';
            if (isPendiente) borderClass = 'border-amber-200 bg-amber-50/20';
            if (isEnProceso) borderClass = 'border-blue-200 bg-blue-50/20';
            if (isCompletada) borderClass = 'border-emerald-200 bg-emerald-50/20 opacity-80';

            return (
              <div
                key={tarea.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between gap-4 transition hover:shadow-md ${borderClass}`}
              >
                <div>
                  {/* Header Tarjeta */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm shrink-0">
                        {tarea.habitacion?.numero}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          Hab. {tarea.habitacion?.numero} ({tarea.habitacion?.tipo})
                        </h3>
                        <span className="text-[11px] text-slate-500 block">
                          Piso {tarea.habitacion?.piso} • Tipo: <strong>{tarea.tipoLimpieza}</strong>
                        </span>
                      </div>
                    </div>
                    {getPrioridadBadge(tarea.prioridad)}
                  </div>

                  {/* Detalle */}
                  <div className="py-3 space-y-2 text-xs">
                    {tarea.observaciones && (
                      <p className="p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 text-[11px] leading-relaxed">
                        📝 {tarea.observaciones}
                      </p>
                    )}

                    {/* Asignación */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Mucama Asignada:
                      </span>
                      {isCompletada ? (
                        <span className="font-bold text-slate-800">
                          {tarea.empleadoAsignado?.nombreCompleto || 'Personal de Turno'}
                        </span>
                      ) : (
                        <select
                          value={tarea.empleadoAsignado?.id || ''}
                          onChange={(e) => handleAsignar(tarea.id, Number(e.target.value))}
                          className="p-1 text-[11px] rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="">Sin asignar</option>
                          {personal.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.nombreCompleto} ({u.rol})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones de Estado */}
                <div className="pt-3 border-t border-slate-100">
                  {isPendiente && (
                    <button
                      onClick={() => handleIniciar(tarea.id)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Play className="w-4 h-4 fill-slate-950" /> Iniciar Limpieza
                    </button>
                  )}

                  {isEnProceso && (
                    <button
                      onClick={() => handleCompletar(tarea.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4" /> Completar & Marcar Disponible
                    </button>
                  )}

                  {isCompletada && (
                    <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-xs py-1">
                      <CheckCircle2 className="w-4 h-4" /> Habitación Limpia y Disponible
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nueva Tarea */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Crear Orden de Limpieza</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearTarea} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Habitación</label>
                <select
                  value={nuevaHabId}
                  onChange={(e) => setNuevaHabId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {habitaciones.map((h) => (
                    <option key={h.id} value={h.id}>
                      Habitación {h.numero} (Piso {h.piso} - {h.tipo}) - [{h.estado}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Tarea</label>
                  <select
                    value={tipoLimpieza}
                    onChange={(e) => setTipoLimpieza(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="CHECKOUT">Check-Out (Completa)</option>
                    <option value="RUTINARIA">Rutinaria / Diaria</option>
                    <option value="PROFUNDA">Profunda / Desinfección</option>
                    <option value="MANTENIMIENTO">Revisión A/C & Servicios</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ALTA">⚡ Alta</option>
                    <option value="URGENTE">🔥 Urgente</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asignar Personal</label>
                <select
                  value={nuevoEmpleadoId}
                  onChange={(e) => setNuevoEmpleadoId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Sin asignar aún</option>
                  {personal.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombreCompleto} ({u.rol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instrucciones u Observaciones</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  placeholder="Ej: Cambio de sábanas king, reponer frigobar y limpiar terraza..."
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
