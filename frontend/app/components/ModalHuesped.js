'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, Mail, Globe, MapPin, CreditCard } from 'lucide-react';
import { useToast } from './Toast';

export default function ModalHuesped({ isOpen, onClose, onSave, huesped = null }) {
  const { addToast } = useToast();
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [nacionalidad, setNacionalidad] = useState('Peruana');
  const [ciudadProcedencia, setCiudadProcedencia] = useState('Lima');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (huesped) {
      setNombres(huesped.nombres || '');
      setApellidos(huesped.apellidos || '');
      setTipoDocumento(huesped.tipoDocumento || 'DNI');
      setNumeroDocumento(huesped.numeroDocumento || '');
      setTelefono(huesped.telefono || '');
      setEmail(huesped.email || '');
      setNacionalidad(huesped.nacionalidad || 'Peruana');
      setCiudadProcedencia(huesped.ciudadProcedencia || 'Lima');
    } else {
      setNombres('');
      setApellidos('');
      setTipoDocumento('DNI');
      setNumeroDocumento('');
      setTelefono('');
      setEmail('');
      setNacionalidad('Peruana');
      setCiudadProcedencia('Lima');
    }
  }, [huesped, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombres || !apellidos || !numeroDocumento) return;
    setLoading(true);

    try {
      const payload = {
        nombres,
        apellidos,
        tipoDocumento,
        numeroDocumento,
        telefono,
        email,
        nacionalidad,
        ciudadProcedencia
      };

      await onSave(payload, huesped?.id);
      addToast(`Huésped ${nombres} ${apellidos} guardado correctamente`, 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Error al guardar datos del huésped', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">
              {huesped ? 'Actualizar Datos del Huésped' : 'Registrar Nuevo Huésped'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombres</label>
              <input
                type="text"
                required
                value={nombres}
                placeholder="Ej: Juan Carlos"
                onChange={(e) => setNombres(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Apellidos</label>
              <input
                type="text"
                required
                value={apellidos}
                placeholder="Ej: Pérez Morales"
                onChange={(e) => setApellidos(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento</label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="DNI">DNI (Perú)</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
                <option value="RUC">RUC Empresa</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">N° de Documento</label>
              <input
                type="text"
                required
                value={numeroDocumento}
                placeholder="Ej: 45892134"
                onChange={(e) => setNumeroDocumento(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
              <input
                type="tel"
                value={telefono}
                placeholder="Ej: 987654321"
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                placeholder="cliente@ejemplo.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nacionalidad</label>
              <input
                type="text"
                value={nacionalidad}
                placeholder="Ej: Peruana, Chilena, Estadounidense..."
                onChange={(e) => setNacionalidad(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ciudad de Procedencia</label>
              <input
                type="text"
                value={ciudadProcedencia}
                placeholder="Ej: Lima, Arequipa, Cusco..."
                onChange={(e) => setCiudadProcedencia(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow"
            >
              {loading ? 'Guardando...' : huesped ? 'Actualizar Huésped' : 'Guardar Huésped'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
