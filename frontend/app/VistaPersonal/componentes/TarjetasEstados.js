'use client';

import React from 'react';
import { BedDouble, CheckCircle2, AlertCircle, Sparkles, Wrench, BookmarkCheck, TrendingUp, DollarSign } from 'lucide-react';

export default function TarjetasEstados({ stats, onFilterEstado }) {
  if (!stats) return null;

  const cards = [
    {
      title: 'Habitaciones Libres',
      value: stats.habitacionesDisponibles,
      total: stats.totalHabitaciones,
      icon: CheckCircle2,
      color: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-200',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      estadoKey: 'DISPONIBLE',
      label: 'Listas para Check-In'
    },
    {
      title: 'Habitaciones Ocupadas',
      value: stats.habitacionesOcupadas,
      total: stats.totalHabitaciones,
      icon: BedDouble,
      color: 'from-rose-500/10 to-red-500/5 text-rose-600 border-rose-200',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      estadoKey: 'OCUPADA',
      label: `${stats.porcentajeOcupacion || 0}% de Ocupación`
    },
    {
      title: 'En Limpieza / Aseo',
      value: stats.habitacionesEnLimpieza,
      total: stats.totalHabitaciones,
      icon: Sparkles,
      color: 'from-amber-500/10 to-yellow-500/5 text-amber-600 border-amber-200',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      estadoKey: 'LIMPIEZA',
      label: 'Tareas asignadas'
    },
    {
      title: 'Reservadas',
      value: stats.habitacionesReservadas,
      total: stats.totalHabitaciones,
      icon: BookmarkCheck,
      color: 'from-purple-500/10 to-indigo-500/5 text-purple-600 border-purple-200',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      estadoKey: 'RESERVADA',
      label: 'Check-in programado'
    },
    {
      title: 'En Mantenimiento',
      value: stats.habitacionesEnMantenimiento,
      total: stats.totalHabitaciones,
      icon: Wrench,
      color: 'from-slate-500/10 to-gray-500/5 text-slate-600 border-slate-200',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
      estadoKey: 'MANTENIMIENTO',
      label: 'Fuera de servicio'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onFilterEstado && onFilterEstado(card.estadoKey)}
            className={`p-4 rounded-2xl border bg-gradient-to-br transition-all duration-200 text-left hover:shadow-md hover:scale-[1.02] flex flex-col justify-between ${card.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">{card.title}</span>
              <Icon className="w-5 h-5 shrink-0 opacity-80" />
            </div>

            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                de {card.total} habs.
              </span>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block w-max ${card.badgeBg}`}>
              {card.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
