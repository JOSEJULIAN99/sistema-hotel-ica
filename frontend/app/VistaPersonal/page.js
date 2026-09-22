'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BellRing,
  BedDouble,
  Sparkles,
  CalendarPlus,
  CalendarCheck2,
  DollarSign,
  TrendingUp,
  UserCheck,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { DashboardAPI, HabitacionAPI, EstadiaAPI, LimpiezaAPI, HuespedAPI, ReservacionAPI } from '../../lib/api';
import TarjetasEstados from './componentes/TarjetasEstados';
import TablaHabitaciones from './componentes/TablaHabitaciones';
import { ModalCheckIn, ModalCheckOut, ModalConsumo, ModalPago } from '../components/ModalesRecepcion';
import ModalReserva from '../components/ModalReserva';
import ModalHabitacion from '../components/ModalHabitacion';
import ComprobanteModal from '../components/ComprobanteModal';
import { useToast } from '../components/Toast';

export default function DashboardPage() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);
  const [estadias, setEstadias] = useState([]);
  const [limpiezas, setLimpiezas] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalCheckInOpen, setModalCheckInOpen] = useState(false);
  const [modalReservaOpen, setModalReservaOpen] = useState(false);
  const [modalHabitacionOpen, setModalHabitacionOpen] = useState(false);
  const [comprobanteData, setComprobanteData] = useState(null);
  const [comprobanteOpen, setComprobanteOpen] = useState(false);

  // Carga de datos
  const loadData = async () => {
    setLoading(true);
    try {
      const [s, h, e, l, hu, r] = await Promise.all([
        DashboardAPI.getStats(),
        HabitacionAPI.getAll(),
        EstadiaAPI.getAll(true),
        LimpiezaAPI.getAll(true),
        HuespedAPI.getAll(),
        ReservacionAPI.getAll()
      ]);
      setStats(s);
      setHabitaciones(h || []);
      setEstadias(e || []);
      setLimpiezas(l || []);
      setHuespedes(hu || []);
      setReservaciones(r || []);
    } catch (err) {
      console.error('Error cargando dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCambiarEstadoHab = async (id, estado) => {
    try {
      await HabitacionAPI.updateEstado(id, estado);
      addToast(`Estado de habitación actualizado a ${estado}`, 'success');
      loadData();
    } catch (err) {
      addToast('Error al actualizar estado', 'error');
    }
  };

  const handleCheckInSuccess = async (payload) => {
    await EstadiaAPI.checkIn(payload);
    loadData();
  };

  const handleReservaSuccess = async (payload) => {
    await ReservacionAPI.create(payload);
    loadData();
  };

  const handleHabitacionSuccess = async (payload) => {
    await HabitacionAPI.create(payload);
    loadData();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Panel Operativo • Hotel Princes Ica
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoreo en tiempo real de ocupación, check-in de huéspedes, tarifas e ingresos.
          </p>
        </div>

        {/* Botones de Acción Rápida */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setModalCheckInOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-2"
          >
            <BellRing className="w-4 h-4" /> Nuevo Check-In
          </button>

          <button
            onClick={() => setModalReservaOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition shadow-md flex items-center gap-2"
          >
            <CalendarPlus className="w-4 h-4 text-amber-400" /> Nueva Reserva
          </button>
        </div>
      </div>

      {/* Métricas y Tarjetas de Estado */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Estado del Hotel & Ocupación
        </h2>
        <TarjetasEstados stats={stats} />
      </section>

      {/* Métricas Financieras y de Flujo Diario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Ingresos del Día</span>
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-white font-mono">
              S/ {Number(stats?.ingresosHoy || 350.00).toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cobros en efectivo, Yape, Plin y tarjetas</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flujo de Hoy</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Check-Ins</span>
              <span className="text-xl font-bold text-slate-900">{stats?.checkInsHoy || estadias.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Check-Outs</span>
              <span className="text-xl font-bold text-slate-900">{stats?.checkOutsHoy || 0}</span>
            </div>
          </div>
          <Link
            href="/VistaPersonal/recepcion"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            Ir a Recepción y Salidas <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reservas Registradas</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600">{reservaciones.length}</span>
              <span className="text-xs text-slate-500 font-medium">reservas en sistema</span>
            </div>
          </div>
          <Link
            href="/VistaPersonal/reservaciones"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Ver Reservaciones <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Rack de Habitaciones Resumen */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Rack Visual de Habitaciones</h2>
            <p className="text-xs text-slate-500">Distribución por estado y disponibilidad inmediata</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalHabitacionOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-slate-600" /> Añadir Habitación
            </button>
            <Link
              href="/VistaPersonal/habitaciones"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Ver Todas <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <TablaHabitaciones
          habitaciones={habitaciones.slice(0, 8)}
          onCambiarEstado={handleCambiarEstadoHab}
        />
      </section>

      {/* Modales */}
      <ModalCheckIn
        isOpen={modalCheckInOpen}
        onClose={() => setModalCheckInOpen(false)}
        onSuccess={handleCheckInSuccess}
        habitaciones={habitaciones}
        huespedes={huespedes}
        reservaciones={reservaciones}
      />

      <ModalReserva
        isOpen={modalReservaOpen}
        onClose={() => setModalReservaOpen(false)}
        onSave={handleReservaSuccess}
        habitaciones={habitaciones}
        huespedes={huespedes}
      />

      <ModalHabitacion
        isOpen={modalHabitacionOpen}
        onClose={() => setModalHabitacionOpen(false)}
        onSave={handleHabitacionSuccess}
      />

      <ComprobanteModal
        isOpen={comprobanteOpen}
        onClose={() => setComprobanteOpen(false)}
        data={comprobanteData}
      />
    </div>
  );
}