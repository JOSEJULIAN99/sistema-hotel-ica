'use client';

import React, { useState, useEffect } from 'react';
import { Bot, BedDouble, ClipboardList, Sparkles, RefreshCw } from 'lucide-react';
import { AsistenteAPI } from '../../../lib/api';
import { AuthAPI } from '../../../lib/auth';

// El asistente solo sugiere: reservar, asignar o cambiar estados lo hace siempre una persona.

const hoyISO = () => new Date().toISOString().split('T')[0];
const enDiasISO = (dias) => new Date(Date.now() + dias * 86400000).toISOString().split('T')[0];

function EtiquetaFuente({ fuente }) {
  const esIA = fuente === 'IA';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        esIA ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
      }`}
    >
      {esIA ? <Sparkles className="w-3 h-3" /> : null}
      {esIA ? 'Redactado con IA' : 'Calculado con reglas'}
    </span>
  );
}

function Tarjeta({ icono: Icono, titulo, descripcion, children }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-slate-900 text-amber-400">
          <Icono className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{titulo}</h2>
          <p className="text-xs text-slate-500">{descripcion}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AsistentePage() {
  const [rol, setRol] = useState('');
  const [iaActiva, setIaActiva] = useState(null);

  // Recomendador
  const [fechaEntrada, setFechaEntrada] = useState(hoyISO);
  const [fechaSalida, setFechaSalida] = useState(() => enDiasISO(2));
  const [personas, setPersonas] = useState(2);
  const [presupuesto, setPresupuesto] = useState('');
  const [preferencias, setPreferencias] = useState('');
  const [recomendacion, setRecomendacion] = useState(null);
  const [cargandoRec, setCargandoRec] = useState(false);

  // Resumen y limpieza
  const [resumen, setResumen] = useState(null);
  const [limpieza, setLimpieza] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const esGerencia = ['ADMINISTRADOR', 'ADMIN', 'GERENTE'].includes(rol);
  const usaRecomendador = ['ADMINISTRADOR', 'ADMIN', 'GERENTE', 'RECEPCIONISTA'].includes(rol);

  const cargarPaneles = async (rolActual) => {
    setCargando(true);
    setError('');
    try {
      const tareas = AsistenteAPI.limpiezaPriorizada();
      const res = ['ADMINISTRADOR', 'ADMIN', 'GERENTE'].includes(rolActual)
        ? AsistenteAPI.resumenDiario()
        : Promise.resolve(null);
      const [t, r] = await Promise.all([tareas, res]);
      setLimpieza(t);
      setResumen(r);
    } catch (err) {
      setError(err.message || 'No se pudo consultar al asistente');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const usuario = AuthAPI.getUsuarioActual();
    const rolActual = String(usuario?.rol || '').toUpperCase();
    setRol(rolActual);
    AsistenteAPI.estado()
      .then(e => setIaActiva(Boolean(e?.iaHabilitada)))
      .catch(() => setIaActiva(false));
    cargarPaneles(rolActual);
  }, []);

  const pedirRecomendacion = async (e) => {
    e.preventDefault();
    setCargandoRec(true);
    setError('');
    try {
      const r = await AsistenteAPI.recomendar({
        fechaEntrada,
        fechaSalida,
        numeroPersonas: personas,
        presupuestoPorNoche: presupuesto,
        preferencias
      });
      setRecomendacion(r);
    } catch (err) {
      setError(err.message || 'No se pudo generar la recomendación');
    } finally {
      setCargandoRec(false);
    }
  };

  const campo = 'w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Asistente de recepción</h1>
            <p className="text-xs text-slate-500">
              Sugiere habitaciones, resume el día y ordena la limpieza. Las decisiones las toma el personal.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {iaActiva !== null && (
            <span className="text-[11px] text-slate-500">
              {iaActiva ? 'IA activa' : 'Modo reglas (sin clave de IA)'}
            </span>
          )}
          <button
            type="button"
            onClick={() => cargarPaneles(rol)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
      </header>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">{error}</div>
      )}

      {usaRecomendador && (
        <Tarjeta
          icono={BedDouble}
          titulo="Recomendador de habitación"
          descripcion="Busca habitaciones libres en las fechas y explica cuál conviene. Luego reserve desde Reservaciones."
        >
          <form onSubmit={pedirRecomendacion} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Entrada</span>
              <input type="date" value={fechaEntrada} min={hoyISO()} onChange={e => setFechaEntrada(e.target.value)} className={campo} required />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Salida</span>
              <input type="date" value={fechaSalida} min={fechaEntrada} onChange={e => setFechaSalida(e.target.value)} className={campo} required />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Personas</span>
              <input type="number" min="1" value={personas} onChange={e => setPersonas(e.target.value)} className={campo} required />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              <span>Presupuesto por noche (S/)</span>
              <input type="number" min="1" step="0.50" value={presupuesto} onChange={e => setPresupuesto(e.target.value)} placeholder="Opcional" className={campo} />
            </label>
            <button
              type="submit"
              disabled={cargandoRec}
              className="h-[42px] rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-60"
            >
              {cargandoRec ? 'Buscando…' : 'Recomendar'}
            </button>
            <label className="col-span-2 md:col-span-5 text-xs font-semibold text-slate-700 space-y-1">
              <span>Preferencias del huésped</span>
              <input type="text" value={preferencias} onChange={e => setPreferencias(e.target.value)} placeholder="Ej.: cama grande, cerca de la piscina, viaja con niños" className={campo} />
            </label>
          </form>

          {recomendacion && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <EtiquetaFuente fuente={recomendacion.fuente} />
                <p className="text-xs text-slate-700 leading-relaxed">{recomendacion.mensaje}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {(recomendacion.datos || []).map((o, i) => (
                  <div key={o.habitacionId} className={`p-3 rounded-xl border ${i === 0 ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                    <p className="text-sm font-bold text-slate-900">Habitación {o.numero}</p>
                    <p className="text-[11px] text-slate-500">{o.tipo} · capacidad {o.capacidad}</p>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      S/ {Number(o.precioPorNoche).toFixed(2)} por noche · total S/ {Number(o.totalEstimado).toFixed(2)}
                    </p>
                    {o.caracteristicas && <p className="text-[11px] text-slate-500 mt-1">{o.caracteristicas}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Tarjeta>
      )}

      {esGerencia && (
        <Tarjeta icono={ClipboardList} titulo="Resumen del día" descripcion="Ocupación, movimientos e ingresos del día en lenguaje simple.">
          {resumen ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <EtiquetaFuente fuente={resumen.fuente} />
              <p className="text-xs text-slate-700 leading-relaxed">{resumen.mensaje}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">{cargando ? 'Generando resumen…' : 'Sin datos.'}</p>
          )}
        </Tarjeta>
      )}

      <Tarjeta icono={Sparkles} titulo="Orden sugerido de limpieza" descripcion="Primero las habitaciones que reciben huésped hoy, luego por prioridad.">
        {limpieza ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <EtiquetaFuente fuente={limpieza.fuente} />
              <p className="text-xs text-slate-700 leading-relaxed">{limpieza.mensaje}</p>
            </div>
            <ol className="space-y-2">
              {(limpieza.datos || []).map((t, i) => (
                <li key={t.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-900">
                    {i + 1}. Habitación {t.habitacion?.numero} · {t.tipoLimpieza}
                  </span>
                  <span className="text-slate-500">{t.prioridad} · {t.estado}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="text-xs text-slate-500">{cargando ? 'Ordenando tareas…' : 'Sin datos.'}</p>
        )}
      </Tarjeta>
    </div>
  );
}
