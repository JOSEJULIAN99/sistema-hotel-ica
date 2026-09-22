'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Plus,
  Search,
  Calendar,
  User,
  BedDouble,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import { ReservacionAPI, HabitacionAPI, HuespedAPI, EstadiaAPI } from '../../../lib/api';
import ModalReserva from '../../components/ModalReserva';
import { ModalCheckIn } from '../../components/ModalesRecepcion';
import { useToast } from '../../components/Toast';

export default function ReservacionesPage() {
  const { addToast } = useToast();
  const [reservaciones, setReservaciones] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalReservaOpen, setModalReservaOpen] = useState(false);
  const [modalCheckInOpen, setModalCheckInOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, h, hu] = await Promise.all([
        ReservacionAPI.getAll(),
        HabitacionAPI.getAll(),
        HuespedAPI.getAll()
      ]);
      setReservaciones(r || []);
      setHabitaciones(h || []);
      setHuespedes(hu || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmar = async (id) => {
    try {
      await ReservacionAPI.confirmar(id);
      addToast('Reservación confirmada exitosamente', 'success');
      loadData();
    } catch (err) {
      addToast('Error al confirmar reservación', 'error');
    }
  };

  const handleCancelar = async (id) => {
    const motivo = window.prompt('Ingresa el motivo de la cancelación:');
    if (motivo !== null) {
      try {
        await ReservacionAPI.cancelar(id, motivo);
        addToast('Reservación cancelada', 'warning');
        loadData();
      } catch (err) {
        addToast('Error al cancelar reservación', 'error');
      }
    }
  };

  const handleGuardarReserva = async (payload) => {
    await ReservacionAPI.create(payload);
    loadData();
  };

  const handleCheckInSuccess = async (payload) => {
    await EstadiaAPI.checkIn(payload);
    loadData();
  };

  // Filtrado
  const reservasFiltradas = reservaciones.filter((r) => {
    if (filtroEstado !== 'TODAS' && r.estado !== filtroEstado) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const cod = (r.codigoReserva || '').toLowerCase();
      const nombre = `${r.huesped?.nombres || ''} ${r.huesped?.apellidos || ''}`.toLowerCase();
      const doc = r.huesped?.numeroDocumento || '';
      const hab = r.habitacion?.numero || '';
      return cod.includes(q) || nombre.includes(q) || doc.includes(q) || hab.includes(q);
    }
    return true;
  });

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'CONFIRMADA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">CONFIRMADA</span>;
      case 'PENDIENTE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">PENDIENTE ADELANTO</span>;
      case 'EN_CURSO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">EN CURSO (HOSPEDADO)</span>;
      case 'CANCELADA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">CANCELADA</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{estado}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <CalendarCheck2 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Control de Reservaciones
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Calendario de reservas anticipadas, confirmación de adelantos y pase a check-in.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalReservaOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva Reservación
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código RES, Huésped o Habitación..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['TODAS', 'PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'CANCELADA'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroEstado(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filtroEstado === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Reservas */}
      {reservasFiltradas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No hay reservaciones registradas</h4>
          <p className="text-xs text-slate-400 mt-1">Crea una nueva reserva para bloquear fechas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reservasFiltradas.map((r) => {
            const canCheckIn = r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE';

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col lg:flex-row justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex flex-col items-center justify-center font-black border border-amber-200 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-amber-700">Hab</span>
                    <span className="text-xl leading-none">{r.habitacion?.numero}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {r.codigoReserva}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">
                        {r.huesped?.nombres} {r.huesped?.apellidos}
                      </h3>
                      {getEstadoBadge(r.estado)}
                    </div>

                    <p className="text-xs text-slate-500">
                      {r.huesped?.tipoDocumento}: <strong>{r.huesped?.numeroDocumento}</strong> • Tel: {r.huesped?.telefono || 'N/A'} • {r.huesped?.nacionalidad}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-700">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {r.fechaEntrada} ➔ {r.fechaSalida}
                      </span>
                      <span>•</span>
                      <span>Hab. {r.habitacion?.numero} ({r.habitacion?.tipo})</span>
                      <span>•</span>
                      <span>{r.numeroPersonas} personas</span>
                    </div>

                    {r.observaciones && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-2">
                        💬 {r.observaciones}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                  <div className="w-full sm:w-auto text-left sm:text-right space-y-1 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between sm:justify-end gap-3 text-slate-500">
                      <span>Total Cotizado:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">S/ {Number(r.precioTotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3 text-slate-500">
                      <span>Adelanto Pagado:</span>
                      <span className="font-mono font-bold text-emerald-600">S/ {Number(r.adelanto || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-3 text-xs font-semibold text-amber-700 border-t border-slate-200 pt-1">
                      <span>Saldo en Hotel:</span>
                      <span className="font-mono">S/ {(Number(r.precioTotal) - Number(r.adelanto || 0)).toFixed(2)}</span>
                    </div>
                  </div>

                  {canCheckIn && (
                    <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => setModalCheckInOpen(true)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <BedDouble className="w-3.5 h-3.5" /> Iniciar Check-In
                      </button>

                      {r.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => handleConfirmar(r.id)}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition border border-emerald-200"
                        >
                          Confirmar Adelanto
                        </button>
                      )}

                      <button
                        onClick={() => handleCancelar(r.id)}
                        className="flex-1 sm:flex-none px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs transition"
                      >
                        Cancelar Reserva
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <ModalReserva
        isOpen={modalReservaOpen}
        onClose={() => setModalReservaOpen(false)}
        onSave={handleGuardarReserva}
        habitaciones={habitaciones}
        huespedes={huespedes}
      />

      <ModalCheckIn
        isOpen={modalCheckInOpen}
        onClose={() => setModalCheckInOpen(false)}
        onSuccess={handleCheckInSuccess}
        habitaciones={habitaciones}
        huespedes={huespedes}
        reservaciones={reservaciones}
      />
    </div>
  );
}
