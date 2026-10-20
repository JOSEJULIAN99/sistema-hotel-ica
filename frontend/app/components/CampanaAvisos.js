'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bell, X, Send } from 'lucide-react';
import { AvisosAPI } from '../../lib/api';
import { useToast } from './Toast';

// Avisos instantáneos (RF-06). Escucha el canal en tiempo real del backend (Server-Sent Events):
// los avisos llegan al instante sin recargar. Recepción y administración también pueden enviarlos.

const TIPOS = [
  { valor: 'LIMPIEZA_URGENTE', etiqueta: 'Limpieza urgente' },
  { valor: 'HUESPED_LLEGANDO', etiqueta: 'Huésped llegando' },
  { valor: 'MANTENIMIENTO', etiqueta: 'Mantenimiento' },
  { valor: 'GENERAL', etiqueta: 'General' }
];
const DESTINOS = [
  { valor: 'LIMPIEZA', etiqueta: 'Limpieza' },
  { valor: 'RECEPCIONISTA', etiqueta: 'Recepción' },
  { valor: '', etiqueta: 'Todo el personal' }
];
const CLAVE_VISTO = 'hotel_ultimo_aviso_visto';

export default function CampanaAvisos({ rol }) {
  const { addToast } = useToast();
  const [abierto, setAbierto] = useState(false);
  const [avisos, setAvisos] = useState([]);
  const [ultimoVisto, setUltimoVisto] = useState(0);
  const [conectado, setConectado] = useState(false);
  const [form, setForm] = useState({ tipo: 'LIMPIEZA_URGENTE', rolDestino: 'LIMPIEZA', habitacionNumero: '', mensaje: '' });
  const toastRef = useRef(addToast);
  toastRef.current = addToast;

  const puedeEnviar = ['ADMINISTRADOR', 'ADMIN', 'GERENTE', 'RECEPCIONISTA', 'LIMPIEZA'].includes(rol);

  useEffect(() => {
    try {
      setUltimoVisto(Number(localStorage.getItem(CLAVE_VISTO) || 0));
    } catch (e) {
      setUltimoVisto(0);
    }
    AvisosAPI.recientes().then(lista => setAvisos(lista || [])).catch(() => {});

    if (typeof window === 'undefined' || !window.EventSource) return undefined;
    const fuente = new EventSource(AvisosAPI.urlStream());
    fuente.addEventListener('conectado', () => setConectado(true));
    fuente.addEventListener('aviso', (evento) => {
      try {
        const aviso = JSON.parse(evento.data);
        setAvisos(prev => [aviso, ...prev.filter(a => a.id !== aviso.id)].slice(0, 30));
        toastRef.current(`${aviso.habitacionNumero ? `Hab. ${aviso.habitacionNumero}: ` : ''}${aviso.mensaje}`, 'info');
      } catch (e) {
        // aviso con formato inesperado: se ignora
      }
    });
    fuente.onerror = () => setConectado(false); // el navegador reintenta la conexión solo
    return () => fuente.close();
  }, []);

  const sinLeer = avisos.filter(a => a.id > ultimoVisto).length;

  const abrir = () => {
    setAbierto(v => !v);
    const maximo = avisos.reduce((m, a) => Math.max(m, a.id || 0), 0);
    setUltimoVisto(maximo);
    try {
      localStorage.setItem(CLAVE_VISTO, String(maximo));
    } catch (e) {
      // sin almacenamiento: el contador vuelve a mostrarse al recargar
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!form.mensaje.trim()) return;
    try {
      await AvisosAPI.enviar({ ...form, rolDestino: form.rolDestino || null, habitacionNumero: form.habitacionNumero || null });
      setForm({ ...form, mensaje: '', habitacionNumero: '' });
      addToast('Aviso enviado', 'success');
    } catch (err) {
      addToast(err.message || 'No se pudo enviar el aviso', 'error');
    }
  };

  const campo = 'w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500';

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {abierto && (
        <div className="mb-3 w-[min(340px,calc(100vw-2.5rem))] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div>
              <p className="text-sm font-bold">Avisos</p>
              <p className={`text-[11px] ${conectado ? 'text-emerald-400' : 'text-slate-400'}`}>
                {conectado ? 'En tiempo real' : 'Reconectando…'}
              </p>
            </div>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar avisos" className="p-1 rounded-lg hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>
          {puedeEnviar && (
            <form onSubmit={enviar} className="p-3 border-b border-slate-200 space-y-2 bg-slate-50">
              <div className="grid grid-cols-2 gap-2">
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className={campo} aria-label="Tipo de aviso">
                  {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
                </select>
                <select value={form.rolDestino} onChange={e => setForm({ ...form, rolDestino: e.target.value })} className={campo} aria-label="Destino">
                  {DESTINOS.map(d => <option key={d.valor} value={d.valor}>{d.etiqueta}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input value={form.habitacionNumero} maxLength={10} placeholder="Hab." aria-label="Número de habitación"
                  onChange={e => setForm({ ...form, habitacionNumero: e.target.value })} className={`${campo} w-16`} />
                <input value={form.mensaje} maxLength={300} placeholder="Mensaje del aviso" aria-label="Mensaje"
                  onChange={e => setForm({ ...form, mensaje: e.target.value })} className={campo} />
                <button type="submit" aria-label="Enviar aviso" className="px-2.5 rounded-lg bg-slate-900 text-white">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
          <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {avisos.length === 0 && <li className="p-4 text-[11px] text-slate-500">Sin avisos recientes.</li>}
            {avisos.map(a => (
              <li key={a.id} className="p-3 text-[11px]">
                <p className="font-semibold text-slate-900">
                  {a.habitacionNumero ? `Hab. ${a.habitacionNumero} · ` : ''}{a.tipo.replace('_', ' ').toLowerCase()}
                </p>
                <p className="text-slate-700">{a.mensaje}</p>
                <p className="text-slate-400">{String(a.fecha || '').replace('T', ' ').slice(0, 16)} · {a.creadoPor}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" onClick={abrir} aria-label="Avisos"
        className="relative ml-auto flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800">
        <Bell className="w-5 h-5" />
        {sinLeer > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-[10px] font-bold flex items-center justify-center">
            {sinLeer > 9 ? '9+' : sinLeer}
          </span>
        )}
      </button>
    </div>
  );
}
