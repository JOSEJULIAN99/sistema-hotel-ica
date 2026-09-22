<<<<<<< HEAD
'use client';

import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, LayoutGrid, List, Filter, Sparkles, Building2, Search } from 'lucide-react';
import { HabitacionAPI } from '../../../lib/api';
import TablaHabitaciones from '../componentes/TablaHabitaciones';
import ModalHabitacion from '../../components/ModalHabitacion';
import { useToast } from '../../components/Toast';

export default function HabitacionesPage() {
  const { addToast } = useToast();
  const [habitaciones, setHabitaciones] = useState([]);
  const [pisoFiltro, setPisoFiltro] = useState('TODOS');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState('grid'); // 'grid' | 'table'
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [habParaEditar, setHabParaEditar] = useState(null);

  const loadHabitaciones = async () => {
    setLoading(true);
    try {
      const data = await HabitacionAPI.getAll();
      setHabitaciones(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabitaciones();
  }, []);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await HabitacionAPI.updateEstado(id, nuevoEstado);
      addToast(`Habitación actualizada a ${nuevoEstado}`, 'success');
      loadHabitaciones();
    } catch (err) {
      addToast('Error al actualizar estado', 'error');
    }
  };

  const handleGuardarHabitacion = async (payload, id) => {
    if (id) {
      await HabitacionAPI.update(id, payload);
    } else {
      await HabitacionAPI.create(payload);
    }
    loadHabitaciones();
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta habitación del sistema?')) {
      try {
        await HabitacionAPI.delete(id);
        addToast('Habitación eliminada correctamente', 'success');
        loadHabitaciones();
      } catch (err) {
        addToast('Error al eliminar habitación', 'error');
      }
    }
  };

  const handleEditar = (hab) => {
    setHabParaEditar(hab);
    setModalOpen(true);
  };

  const handleNueva = () => {
    setHabParaEditar(null);
    setModalOpen(true);
  };

  // Filtrado
  const habitacionesFiltradas = habitaciones.filter((h) => {
    if (pisoFiltro !== 'TODOS' && String(h.piso) !== String(pisoFiltro)) return false;
    if (estadoFiltro !== 'TODOS' && h.estado !== estadoFiltro) return false;
    if (tipoFiltro !== 'TODOS' && h.tipo !== tipoFiltro) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const nro = String(h.numero).toLowerCase();
      const desc = (h.descripcion || '').toLowerCase();
      const car = (h.caracteristicas || '').toLowerCase();
      return nro.includes(q) || desc.includes(q) || car.includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <BedDouble className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Gestión & Rack de Habitaciones
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Organización de dormitorios por piso, configuración de tarifas y control de mantenimiento.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleNueva}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva Habitación
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por N° habitación o equipamiento..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Selector de Piso */}
            <select
              value={pisoFiltro}
              onChange={(e) => setPisoFiltro(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODOS">🏢 Todos los Pisos</option>
              <option value="1">Piso 1</option>
              <option value="2">Piso 2</option>
              <option value="3">Piso 3</option>
            </select>

            {/* Selector de Estado */}
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="DISPONIBLE">🟢 Disponible</option>
              <option value="OCUPADA">🔴 Ocupada</option>
              <option value="LIMPIEZA">🟡 Limpieza</option>
              <option value="RESERVADA">🟣 Reservada</option>
              <option value="MANTENIMIENTO">⚪ Mantenimiento</option>
            </select>

            {/* Selector de Tipo */}
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODOS">Todos los Tipos</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="DOBLE">Doble</option>
              <option value="MATRIMONIAL">Matrimonial</option>
              <option value="SUITE">Suite</option>
              <option value="FAMILIAR">Familiar</option>
            </select>

            {/* Selector de Vista Grid / Table */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setVista('grid')}
                className={`p-1.5 rounded-lg transition ${
                  vista === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista Cuadrícula / Rack"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVista('table')}
                className={`p-1.5 rounded-lg transition ${
                  vista === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista Tabla Detallada"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visualización de Habitaciones */}
      <TablaHabitaciones
        habitaciones={habitacionesFiltradas}
        onCambiarEstado={handleCambiarEstado}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        vista={vista}
      />

      {/* Modal */}
      <ModalHabitacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleGuardarHabitacion}
        habitacion={habParaEditar}
      />
    </div>
  );
}
=======
import Link from 'next/link';
import Image from 'next/image';

export default function HabitacionesPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* 1. Sidebar (Menú Lateral Institucional) */}
      <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo y Subtítulo */}
          <div className="p-6 border-b border-slate-700/60">
            <Image 
              src="/hotel2.jpg" 
              alt="Logo The Royal Hotel" 
              width={140} 
              height={45} 
              className="object-contain mb-1.5" 
            />
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold pl-1">
              Sistema de Gestión
            </p>
          </div>

          {/* Opciones de Navegación */}
          <nav className="p-4 space-y-1 text-xs font-medium">
            <Link href="/app/VistaPersonal/dashboard" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              📊 Dashboard
            </Link>
            <Link href="/app/VistaPersonal/reservas" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              📅 Reservas
            </Link>
            <Link href="/VistaPersonal/habitaciones" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🔑 Check-in / Check-out
            </Link>
            <Link href="/VistaPersonal/habitaciones" className="flex items-center gap-3 px-4 py-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg">
              🛏️ Habitaciones
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🧹 Limpieza
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🔧 Mantenimiento
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              💳 Consumos
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              📄 Pagos y facturación
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              👥 Usuarios y roles
            </Link>
          </nav>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="p-4 border-t border-slate-700/60">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-medium w-full"
          >
            <span>❌​</span>
            <span>Cerrar sesión</span>
          </Link>
        </div>
      </aside>

      {/* 2. Área Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Control de Habitaciones</h2>
            <p className="text-xs text-gray-500">Estado general y disponibilidad de la infraestructura hotelera</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
              📅 Hoy, 16 de septiembre de 2025
            </span>
            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
              <div className="bg-blue-600 text-white font-bold w-9 h-9 rounded-full flex items-center justify-center">
                AT
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Ana Torres</p>
                <p className="text-[11px] text-gray-500">Recepción</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la Página */}
        <div className="p-10 space-y-6">
          
          {/* Filtros rápidos por estado */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Disponibles</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">12</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Ocupadas</p>
              <p className="text-xl font-bold text-blue-600 mt-1">16</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">En Limpieza</p>
              <p className="text-xl font-bold text-amber-600 mt-1">2</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Mantenimiento</p>
              <p className="text-xl font-bold text-rose-600 mt-1">0</p>
            </div>
          </div>

          {/* Listado / Tabla de Habitaciones */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Listado de Habitaciones</h3>
              <input 
                type="text" 
                placeholder="Buscar habitación..." 
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs w-64 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Número</th>
                  <th className="p-4 font-semibold">Tipo</th>
                  <th className="p-4 font-semibold">Precio / Noche</th>
                  <th className="p-4 font-semibold">Estado Actual</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">102</td>
                  <td className="p-4">Matrimonial</td>
                  <td className="p-4">S/ 180.00</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Ocupada</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-500 hover:text-blue-600 font-medium">Ver detalle</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">204</td>
                  <td className="p-4">Doble</td>
                  <td className="p-4">S/ 240.00</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Disponible</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-500 hover:text-blue-600 font-medium">Ver detalle</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">308</td>
                  <td className="p-4">Simple</td>
                  <td className="p-4">S/ 120.00</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium text-[11px]">En Limpieza</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-500 hover:text-blue-600 font-medium">Ver detalle</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
>>>>>>> origin/frontend-VistaPersonal
