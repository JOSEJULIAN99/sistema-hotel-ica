'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { PublicoAPI } from '../../lib/api';

// Chatbot 24/7 para huéspedes (RF-10). Responde en el idioma del visitante con la
// información que el administrador cargó en Configuración IA. La conversación se guarda
// solo en esta pestaña del navegador (sessionStorage).

const CLAVE = 'hotel_chat_huesped';
const BIENVENIDA = {
  rol: 'asistente',
  contenido: '¡Hola! Soy el asistente del hotel. Pregúntame por horarios, tarifas, servicios o qué visitar en Ica. You can also write in English.'
};

function leerConversacion() {
  try {
    const guardada = JSON.parse(sessionStorage.getItem(CLAVE));
    return Array.isArray(guardada) && guardada.length ? guardada : [BIENVENIDA];
  } catch (e) {
    return [BIENVENIDA];
  }
}

export default function ChatHuesped() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([BIENVENIDA]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    setMensajes(leerConversacion());
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(mensajes.slice(-20)));
    } catch (e) {
      // sin almacenamiento disponible: la conversación vive solo en memoria
    }
    if (finRef.current) finRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, abierto]);

  const enviar = async (e) => {
    e.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;
    const nuevos = [...mensajes, { rol: 'usuario', contenido }];
    setMensajes(nuevos);
    setTexto('');
    setEnviando(true);
    try {
      // Se envían los últimos mensajes (sin la bienvenida) para dar contexto a la IA
      const historial = nuevos.filter(m => m.contenido !== BIENVENIDA.contenido).slice(-12);
      const r = await PublicoAPI.chat(historial);
      setMensajes([...nuevos, { rol: 'asistente', contenido: r.respuesta }]);
    } catch (err) {
      setMensajes([...nuevos, { rol: 'asistente', contenido: err.message || 'No pude responder ahora. Intente en unos segundos.' }]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {abierto && (
        <div className="mb-3 w-[min(360px,calc(100vw-2.5rem))] h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div>
              <p className="text-sm font-bold">Asistente del hotel</p>
              <p className="text-[11px] text-amber-400">Disponible 24/7 · responde en tu idioma</p>
            </div>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar chat" className="p-1 rounded-lg hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs whitespace-pre-line ${
                  m.rol === 'usuario' ? 'bg-amber-500 text-slate-950 rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                }`}>
                  {m.contenido}
                </p>
              </div>
            ))}
            {enviando && <p className="text-[11px] text-slate-500 px-1">Escribiendo…</p>}
            <div ref={finRef} />
          </div>
          <form onSubmit={enviar} className="p-2 border-t border-slate-200 flex gap-2">
            <input value={texto} onChange={e => setTexto(e.target.value)} maxLength={800}
              placeholder="Escribe tu pregunta…" aria-label="Mensaje"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <button type="submit" disabled={enviando || !texto.trim()} aria-label="Enviar"
              className="px-3 rounded-xl bg-slate-900 text-white disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setAbierto(v => !v)} aria-label="Abrir chat del hotel"
        className="ml-auto flex items-center gap-2 px-4 py-3 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-xl hover:bg-amber-400">
        <MessageCircle className="w-5 h-5" /> {abierto ? 'Cerrar' : '¿Dudas? Escríbenos'}
      </button>
    </div>
  );
}
