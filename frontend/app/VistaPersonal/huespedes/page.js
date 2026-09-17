'use client';

import React, { useState, useEffect } from 'react';
import { Users2, Plus, Search, User, Phone, Mail, Globe, MapPin, Edit2, Trash2 } from 'lucide-react';
import { HuespedAPI } from '../../../lib/api';
import ModalHuesped from '../../components/ModalHuesped';
import { useToast } from '../../components/Toast';

export default function HuespedesPage() {
  const { addToast } = useToast();
  const [huespedes, setHuespedes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [huespedEditar, setHuespedEditar] = useState(null);

  const loadHuespedes = async () => {
    setLoading(true);
    try {
      const data = await HuespedAPI.getAll(busqueda);
      setHuespedes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHuespedes();
  }, [busqueda]);

  const handleGuardar = async (payload, id) => {
    if (id) {
      await HuespedAPI.update(id, payload);
    } else {
      await HuespedAPI.create(payload);
    }
    loadHuespedes();
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Deseas eliminar este registro de huésped?')) {
      try {
        await HuespedAPI.delete(id);
        addToast('Huésped eliminado', 'success');
        loadHuespedes();
      } catch (err) {
        addToast('Error al eliminar huésped', 'error');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Users2 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Directorio de Huéspedes
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Base de datos de clientes, historial de documentos de identidad y contactos.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setHuespedEditar(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Registrar Nuevo Huésped
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombres, apellidos o N° de documento..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>
      </div>

      {/* Grid de Huéspedes */}
      {huespedes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No se encontraron huéspedes</h4>
          <p className="text-xs text-slate-400 mt-1">Registra nuevos clientes o cambia los términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {huespedes.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shrink-0">
                      {h.nombres ? h.nombres.charAt(0) : 'H'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {h.nombres} {h.apellidos}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {h.tipoDocumento}: <strong>{h.numeroDocumento}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {h.telefono && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{h.telefono}</span>
                    </p>
                  )}
                  {h.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{h.email}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{h.ciudadProcedencia || 'Lima'} • {h.nacionalidad || 'Peruana'}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setHuespedEditar(h);
                    setModalOpen(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                  title="Editar datos"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEliminar(h.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Eliminar registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ModalHuesped
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleGuardar}
        huesped={huespedEditar}
      />
    </div>
  );
}
