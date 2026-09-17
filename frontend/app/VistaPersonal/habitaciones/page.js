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
