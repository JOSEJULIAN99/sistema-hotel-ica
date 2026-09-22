'use client';

import React from 'react';
import { Bed, Users, Sparkles, Wrench, CheckCircle2, BookmarkCheck, MoreVertical, Edit2, Trash2, ArrowRight } from 'lucide-react';

export default function TablaHabitaciones({
  habitaciones = [],
  onCambiarEstado,
  onEditar,
  onEliminar,
  onSeleccionarHabitacion,
  vista = 'grid' // 'grid' | 'table'
}) {
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'DISPONIBLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Disponible
          </span>
        );
      case 'OCUPADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Ocupada
          </span>
        );
      case 'LIMPIEZA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"></span>
            En Limpieza
          </span>
        );
      case 'RESERVADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Reservada
          </span>
        );
      case 'MANTENIMIENTO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Mantenimiento
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{estado}</span>;
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'INDIVIDUAL': return 'Single / Individual';
      case 'DOBLE': return 'Doble (2 camas)';
      case 'MATRIMONIAL': return 'Matrimonial King';
      case 'SUITE': return 'Suite Deluxe Jacuzzi';
      case 'FAMILIAR': return 'Familiar Amplia';
      default: return tipo;
    }
  };

  if (habitaciones.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Bed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-700">No se encontraron habitaciones</h4>
        <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros de estado o piso.</p>
      </div>
    );
  }

  if (vista === 'table') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                <th className="py-3.5 px-4">Habitación</th>
                <th className="py-3.5 px-4">Piso</th>
                <th className="py-3.5 px-4">Tipo & Capacidad</th>
                <th className="py-3.5 px-4">Precio / Noche</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {habitaciones.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-900 text-sm border border-slate-200">
                        {h.numero}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">Hab. {h.numero}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{h.caracteristicas}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">Piso {h.piso}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{getTipoLabel(h.tipo)}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Hasta {h.capacidad} personas
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    S/ {Number(h.precioPorNoche).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">{getEstadoBadge(h.estado)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Cambio rápido de estado */}
                      <select
                        value={h.estado}
                        onChange={(e) => onCambiarEstado && onCambiarEstado(h.id, e.target.value)}
                        className="text-[11px] font-semibold p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="DISPONIBLE">🟢 Disponible</option>
                        <option value="OCUPADA">🔴 Ocupada</option>
                        <option value="LIMPIEZA">🟡 Limpieza</option>
                        <option value="RESERVADA">🟣 Reservada</option>
                        <option value="MANTENIMIENTO">⚪ Mantenimiento</option>
                      </select>

                      {onEditar && (
                        <button
                          onClick={() => onEditar(h)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Editar habitación"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {onEliminar && (
                        <button
                          onClick={() => onEliminar(h.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar habitación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Vista Grid / Rack Visual
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {habitaciones.map((h) => {
        let borderCard = 'border-slate-200';
        let bgHeader = 'bg-slate-50';

        if (h.estado === 'DISPONIBLE') {
          borderCard = 'border-emerald-200 hover:border-emerald-400';
          bgHeader = 'bg-emerald-50/50';
        } else if (h.estado === 'OCUPADA') {
          borderCard = 'border-rose-200 hover:border-rose-400';
          bgHeader = 'bg-rose-50/50';
        } else if (h.estado === 'LIMPIEZA') {
          borderCard = 'border-amber-200 hover:border-amber-400';
          bgHeader = 'bg-amber-50/50';
        } else if (h.estado === 'RESERVADA') {
          borderCard = 'border-purple-200 hover:border-purple-400';
          bgHeader = 'bg-purple-50/50';
        }

        return (
          <div
            key={h.id}
            className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between ${borderCard}`}
          >
            {/* Header de la Habitación */}
            <div className={`p-4 border-b border-slate-100 flex items-start justify-between ${bgHeader}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900">Hab. {h.numero}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    Piso {h.piso}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600 block mt-0.5">
                  {getTipoLabel(h.tipo)}
                </span>
              </div>
              <div>{getEstadoBadge(h.estado)}</div>
            </div>

            {/* Cuerpo */}
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" /> Capacidad:
                </span>
                <span className="font-bold text-slate-800">{h.capacidad} Huéspedes</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Tarifa por noche:</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  S/ {Number(h.precioPorNoche).toFixed(2)}
                </span>
              </div>

              {h.caracteristicas && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    ✨ {h.caracteristicas}
                  </p>
                </div>
              )}
            </div>

            {/* Acciones Rápidas */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <select
                value={h.estado}
                onChange={(e) => onCambiarEstado && onCambiarEstado(h.id, e.target.value)}
                className="text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="DISPONIBLE">🟢 Disponible</option>
                <option value="OCUPADA">🔴 Ocupada</option>
                <option value="LIMPIEZA">🟡 Limpieza</option>
                <option value="RESERVADA">🟣 Reservada</option>
                <option value="MANTENIMIENTO">⚪ Mantenimiento</option>
              </select>

              <div className="flex items-center gap-1">
                {onEditar && (
                  <button
                    onClick={() => onEditar(h)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onEliminar && (
                  <button
                    onClick={() => onEliminar(h.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
