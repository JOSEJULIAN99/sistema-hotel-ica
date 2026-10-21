'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  BedDouble,
  CalendarCheck2,
  CalendarPlus,
  Clock,
  DollarSign,
  Filter,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  UserCheck,
  BellRing,
  X
} from 'lucide-react';

import {
  DashboardAPI,
  HabitacionAPI,
  EstadiaAPI,
  HuespedAPI,
  ReservacionAPI,
} from '../../lib/api';

import { AuthAPI } from '../../lib/auth';

import TablaHabitaciones from './componentes/TablaHabitaciones';
import TarjetasEstados from './componentes/TarjetasEstados';
import { useToast } from '../components/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [usuario, setUsuario] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState(null);

  const [habitaciones, setHabitaciones] = useState([]);
  const [estadias, setEstadias] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);

  const [loading, setLoading] = useState(true);

  // Filtros del Rack
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroPiso, setFiltroPiso] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [vistaRack, setVistaRack] = useState('grid');

  useEffect(() => {
    const activeUser = AuthAPI.getUsuarioActual();
    if (!activeUser) {
      router.replace('/VistaPersonal/login');
      return;
    }
    setUsuario(activeUser);
    setAuthChecked(true);
  }, [router]);

  const userRole = String(
    usuario?.rol ||
      usuario?.role ||
      (typeof window !== 'undefined' ? localStorage.getItem('userRole') || '' : '')
  ).toUpperCase();

  const esAdmin = userRole === 'ADMIN' || userRole === 'ADMINISTRADOR' || userRole === 'GERENTE';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        statsData,
        habitacionesData,
        estadiasData,
        huespedesData,
        reservacionesData,
      ] = await Promise.all([
        DashboardAPI.getStats(),
        HabitacionAPI.getAll(),
        EstadiaAPI.getAll(true),
        HuespedAPI.getAll(),
        ReservacionAPI.getAll(),
      ]);

      setStats(statsData || null);
      setHabitaciones(habitacionesData || []);
      setEstadias(estadiasData || []);
      setHuespedes(huespedesData || []);
      setReservaciones(reservacionesData || []);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      if (addToast) {
        addToast('No se pudo cargar toda la información del dashboard.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (authChecked) {
      loadData();
    }
  }, [authChecked, loadData]);

  const pisos = useMemo(() => {
    const valores = habitaciones
      .map((h) => h.piso ?? h.numeroPiso ?? h.nivel)
      .filter((v) => v !== undefined && v !== null && v !== '');
    return [...new Set(valores.map(String))].sort((a, b) => Number(a) - Number(b));
  }, [habitaciones]);

  const tipos = useMemo(() => {
    const valores = habitaciones
      .map((h) => h.tipo ?? h.tipoHabitacion ?? h.categoria)
      .filter((v) => v !== undefined && v !== null && v !== '');
    return [...new Set(valores.map(String))].sort();
  }, [habitaciones]);

  const habitacionesFiltradas = useMemo(() => {
    return habitaciones.filter((habitacion) => {
      const numero = String(habitacion.numero ?? habitacion.numeroHabitacion ?? habitacion.codigo ?? '');
      const estado = String(habitacion.estado ?? '');
      const piso = String(habitacion.piso ?? habitacion.numeroPiso ?? habitacion.nivel ?? '');
      const tipo = String(habitacion.tipo ?? habitacion.tipoHabitacion ?? habitacion.categoria ?? '');

      const textoBusqueda = busqueda.trim().toLowerCase();
      const coincideBusqueda =
        !textoBusqueda ||
        numero.toLowerCase().includes(textoBusqueda) ||
        tipo.toLowerCase().includes(textoBusqueda) ||
        estado.toLowerCase().includes(textoBusqueda);

      const coincideEstado = filtroEstado === 'TODOS' || estado.toUpperCase() === filtroEstado.toUpperCase();
      const coincidePiso = filtroPiso === 'TODOS' || piso === filtroPiso;
      const coincideTipo = filtroTipo === 'TODOS' || tipo.toUpperCase() === filtroTipo.toUpperCase();

      return coincideBusqueda && coincideEstado && coincidePiso && coincideTipo;
    });
  }, [habitaciones, busqueda, filtroEstado, filtroPiso, filtroTipo]);

  const handleRefresh = () => {
    loadData();
  };

  if (!authChecked || !usuario) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {esAdmin
                ? 'Panel Administrativo • Hotel Princes Ica'
                : 'Panel Operativo • Hotel Princes Ica'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoreo general de la operación, ocupación e información financiera del hotel en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Redireccion a recepcion y check in */}
          <button
            type="button"
            onClick={() => router.push('/VistaPersonal/recepcion')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <BellRing className="w-4 h-4" /> Nuevo Check-In
          </button>

          {/* Redireccion a reservas */}
          <button
            type="button"
            onClick={() => router.push('/VistaPersonal/reservaciones')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4 text-amber-400" /> Nueva Reserva
          </button>
        </div>
      </div>

      {/* Tarjetas de estado */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Estado del Hotel & Ocupación
        </h2>
        <TarjetasEstados stats={stats} />
      </section>

      {/* Rack visual de habitaciones */}
      <section className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Gestión & Rack de Habitaciones
            </h2>
            <p className="text-xs text-slate-500">
              Organización de dormitorios por piso, configuración de tarifas y control de mantenimiento.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {esAdmin && (
              <button
                type="button"
                onClick={() => router.push('/VistaPersonal/habitaciones')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Añadir Habitación
              </button>
            )}
          </div>
        </div>

        {/* Barra de buscador y filtros */}
        <div className="flex flex-col xl:flex-row gap-3 items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
          
          <div className="relative flex-1 w-full min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por N° habitación o equipamiento..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
            <select
              value={filtroPiso}
              onChange={(e) => setFiltroPiso(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Todos los Pisos</option>
              {pisos.map((piso) => (
                <option key={String(piso)} value={String(piso)}>Piso {piso}</option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="OCUPADA">Ocupada</option>
              <option value="RESERVADA">Reservada</option>
              <option value="LIMPIEZA">Limpieza</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Todos los Tipos</option>
              {tipos.map((tipo) => (
                <option key={String(tipo)} value={String(tipo)}>{tipo}</option>
              ))}
            </select>

            {/* Botones de cambio de vista(Grid/Tabla */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setVistaRack('grid')}
                className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  vistaRack === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Vista de Tarjetas"
              >
                <BedDouble className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setVistaRack('table')}
                className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  vistaRack === 'table' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Vista de Tabla"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Tabla/Rack de habitaciones */}
        <TablaHabitaciones
          habitaciones={habitacionesFiltradas}
          vista={vistaRack}
          usuarioRol={userRole}
          onCambiarEstado={loadData}
        />

      </section>

    </div>
  );
}