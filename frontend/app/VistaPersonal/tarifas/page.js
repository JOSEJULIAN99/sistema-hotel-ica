'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, CalendarDays, History, Tags, RefreshCw, Check, X, Plus, Trash2 } from 'lucide-react';
import { TarifasAPI, EventosAPI } from '../../../lib/api';
import { AuthAPI } from '../../../lib/auth';
import { useToast } from '../../components/Toast';

// Motor de tarifas dinámicas: el sistema propone, el administrador decide y todo queda en el historial.

const TIPOS_EVENTO = [
  { valor: 'FERIADO_NACIONAL', etiqueta: 'Feriado nacional' },
  { valor: 'FESTIVIDAD_LOCAL', etiqueta: 'Festividad de Ica' },
  { valor: 'EVENTO', etiqueta: 'Evento' },
  { valor: 'TEMPORADA_ALTA', etiqueta: 'Temporada alta' }
];
const ETIQUETA_TIPO = Object.fromEntries(TIPOS_EVENTO.map(t => [t.valor, t.etiqueta]));
const COLOR_ESTADO = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  APROBADA: 'bg-emerald-100 text-emerald-800',
  RECHAZADA: 'bg-rose-100 text-rose-800',
  VENCIDA: 'bg-slate-200 text-slate-600'
};
const campo = 'w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500';
const eventoVacio = { nombre: '', tipo: 'EVENTO', fechaInicio: '', fechaFin: '', porcentajeSugerido: '', descripcion: '' };

function Estado({ estado }) {
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${COLOR_ESTADO[estado] || ''}`}>{estado}</span>;
}

function TarjetaRecomendacion({ r, puedeDecidir, onDecidir }) {
  const [porcentaje, setPorcentaje] = useState(r.porcentaje);
  const [comentario, setComentario] = useState('');
  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-900">+{r.porcentaje} % · {r.fechaInicio} al {r.fechaFin}</p>
          <p className="text-[11px] text-slate-500">
            {r.eventos || 'Sin evento'} · ocupación prevista {r.ocupacionPrevista ?? 0} %
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.fuente === 'IA' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
          {r.fuente === 'IA' ? 'Justificación con IA' : 'Justificación por reglas'}
        </span>
      </div>
      <p className="text-xs text-slate-700 leading-relaxed">{r.justificacion}</p>
      <p className="text-[11px] text-slate-500">Cálculo: {r.motivo}</p>
      {puedeDecidir && (
        <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-slate-100">
          <label className="text-[11px] font-semibold text-slate-700 space-y-1">
            <span>% a aplicar</span>
            <input type="number" min="0" max="100" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} className={`${campo} w-20`} />
          </label>
          <label className="flex-1 min-w-[180px] text-[11px] font-semibold text-slate-700 space-y-1">
            <span>Comentario (queda en el historial)</span>
            <input value={comentario} maxLength={500} onChange={e => setComentario(e.target.value)} placeholder="Ej.: competencia cobra +25 %" className={campo} />
          </label>
          <button type="button" onClick={() => onDecidir(r.id, true, porcentaje, comentario)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
            <Check className="w-4 h-4" /> Aprobar
          </button>
          <button type="button" onClick={() => onDecidir(r.id, false, null, comentario)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-50">
            <X className="w-4 h-4" /> Rechazar
          </button>
        </div>
      )}
    </div>
  );
}

export default function TarifasPage() {
  const { addToast } = useToast();
  const [pestana, setPestana] = useState('pendientes');
  const [esAdmin, setEsAdmin] = useState(false);
  const [pendientes, setPendientes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState(eventoVacio);
  const [nuevaTemporada, setNuevaTemporada] = useState({ nombre: '', fechaInicio: '', fechaFin: '', porcentaje: '' });

  const cargar = async () => {
    setCargando(true);
    try {
      const [p, h, e, t] = await Promise.all([
        TarifasAPI.pendientes(), TarifasAPI.historial(), EventosAPI.listar(), TarifasAPI.temporadas()
      ]);
      setPendientes(p || []);
      setHistorial(h || []);
      setEventos(e || []);
      setTemporadas(t || []);
    } catch (err) {
      addToast(err.message || 'No se pudo cargar el motor de tarifas', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const rol = String(AuthAPI.getUsuarioActual()?.rol || '').toUpperCase();
    setEsAdmin(rol === 'ADMINISTRADOR' || rol === 'ADMIN');
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analizar = async () => {
    setAnalizando(true);
    try {
      const nuevas = await TarifasAPI.analizar();
      addToast(nuevas.length ? `${nuevas.length} recomendaciones nuevas` : 'No hay subidas que recomendar en el horizonte', 'success');
      await cargar();
      setPestana('pendientes');
    } catch (err) {
      addToast(err.message || 'No se pudo analizar', 'error');
    } finally {
      setAnalizando(false);
    }
  };

  const decidir = async (id, aprobar, porcentaje, comentario) => {
    try {
      await TarifasAPI.decidir(id, aprobar, porcentaje, comentario);
      addToast(aprobar ? 'Tarifa aprobada: aplica a reservas nuevas de esas fechas' : 'Recomendación rechazada', 'success');
      cargar();
    } catch (err) {
      addToast(err.message || 'No se pudo registrar la decisión', 'error');
    }
  };

  const guardarEvento = async (e) => {
    e.preventDefault();
    try {
      await EventosAPI.crear({
        ...nuevoEvento,
        porcentajeSugerido: nuevoEvento.porcentajeSugerido === '' ? null : Number(nuevoEvento.porcentajeSugerido)
      });
      addToast('Evento registrado. Analice de nuevo para ver su efecto.', 'success');
      setNuevoEvento(eventoVacio);
      cargar();
    } catch (err) {
      addToast(err.message || 'No se pudo registrar el evento', 'error');
    }
  };

  const eliminarEvento = async (id) => {
    if (!window.confirm('¿Eliminar este evento del calendario?')) return;
    try {
      await EventosAPI.eliminar(id);
      cargar();
    } catch (err) {
      addToast(err.message || 'No se pudo eliminar', 'error');
    }
  };

  const guardarTemporada = async (e) => {
    e.preventDefault();
    try {
      await TarifasAPI.crearTemporada({ ...nuevaTemporada, porcentaje: Number(nuevaTemporada.porcentaje) });
      addToast('Tarifa de temporada creada', 'success');
      setNuevaTemporada({ nombre: '', fechaInicio: '', fechaFin: '', porcentaje: '' });
      cargar();
    } catch (err) {
      addToast(err.message || 'No se pudo crear la tarifa', 'error');
    }
  };

  const desactivar = async (id) => {
    try {
      await TarifasAPI.desactivarTemporada(id);
      cargar();
    } catch (err) {
      addToast(err.message || 'No se pudo desactivar', 'error');
    }
  };

  const pestanas = [
    { id: 'pendientes', etiqueta: `Por decidir (${pendientes.length})`, icono: TrendingUp },
    { id: 'eventos', etiqueta: 'Calendario de eventos', icono: CalendarDays },
    { id: 'temporadas', etiqueta: 'Tarifas vigentes', icono: Tags },
    { id: 'historial', etiqueta: 'Historial de decisiones', icono: History }
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Tarifas dinámicas</h1>
            <p className="text-xs text-slate-500">
              Subidas sugeridas por feriados, festividades, eventos y ocupación alta. Ningún precio cambia sin aprobación.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={cargar}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          {esAdmin && (
            <button type="button" onClick={analizar} disabled={analizando}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-60">
              {analizando ? 'Analizando…' : 'Analizar próximas fechas'}
            </button>
          )}
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {pestanas.map(p => (
          <button key={p.id} type="button" onClick={() => setPestana(p.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
              pestana === p.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'
            }`}>
            <p.icono className="w-4 h-4" /> {p.etiqueta}
          </button>
        ))}
      </nav>

      {pestana === 'pendientes' && (
        <section className="space-y-3">
          {pendientes.length === 0 && (
            <p className="text-xs text-slate-500">No hay recomendaciones por decidir. El sistema analiza cada día a las 06:00.</p>
          )}
          {pendientes.map(r => (
            <TarjetaRecomendacion key={r.id} r={r} puedeDecidir={esAdmin} onDecidir={decidir} />
          ))}
        </section>
      )}

      {pestana === 'eventos' && (
        <section className="space-y-4">
          {esAdmin && (
            <form onSubmit={guardarEvento} className="p-4 rounded-2xl border border-slate-200 bg-white grid md:grid-cols-6 gap-2 items-end">
              <input required placeholder="Nombre del evento" value={nuevoEvento.nombre}
                onChange={e => setNuevoEvento({ ...nuevoEvento, nombre: e.target.value })} className={`${campo} md:col-span-2`} />
              <select value={nuevoEvento.tipo} onChange={e => setNuevoEvento({ ...nuevoEvento, tipo: e.target.value })} className={campo}>
                {TIPOS_EVENTO.map(t => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
              </select>
              <input required type="date" value={nuevoEvento.fechaInicio}
                onChange={e => setNuevoEvento({ ...nuevoEvento, fechaInicio: e.target.value })} className={campo} aria-label="Fecha de inicio" />
              <input required type="date" value={nuevoEvento.fechaFin} min={nuevoEvento.fechaInicio}
                onChange={e => setNuevoEvento({ ...nuevoEvento, fechaFin: e.target.value })} className={campo} aria-label="Fecha de fin" />
              <input type="number" min="0" max="100" placeholder="% (opcional)" value={nuevoEvento.porcentajeSugerido}
                onChange={e => setNuevoEvento({ ...nuevoEvento, porcentajeSugerido: e.target.value })} className={campo} />
              <input placeholder="Descripción (opcional)" value={nuevoEvento.descripcion}
                onChange={e => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })} className={`${campo} md:col-span-5`} />
              <button type="submit" className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </form>
          )}
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="p-3 text-left">Fechas</th><th className="p-3 text-left">Evento</th><th className="p-3 text-left">Tipo</th><th className="p-3 text-left">% sugerido</th><th className="p-3 text-left">Nota</th><th className="p-3" /></tr>
              </thead>
              <tbody>
                {eventos.map(ev => (
                  <tr key={ev.id} className="border-t border-slate-100">
                    <td className="p-3 whitespace-nowrap">{ev.fechaInicio}{ev.fechaFin !== ev.fechaInicio ? ` al ${ev.fechaFin}` : ''}</td>
                    <td className="p-3 font-semibold text-slate-900">{ev.nombre}</td>
                    <td className="p-3">{ETIQUETA_TIPO[ev.tipo]}</td>
                    <td className="p-3">{ev.porcentajeSugerido != null ? `+${ev.porcentajeSugerido} %` : 'Regla del tipo'}</td>
                    <td className="p-3 text-slate-500">{ev.descripcion}</td>
                    <td className="p-3 text-right">
                      {esAdmin && (
                        <button type="button" onClick={() => eliminarEvento(ev.id)} aria-label={`Eliminar ${ev.nombre}`} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {pestana === 'temporadas' && (
        <section className="space-y-4">
          {esAdmin && (
            <form onSubmit={guardarTemporada} className="p-4 rounded-2xl border border-slate-200 bg-white grid md:grid-cols-5 gap-2 items-end">
              <input required placeholder="Nombre (ej.: Promoción de invierno)" value={nuevaTemporada.nombre}
                onChange={e => setNuevaTemporada({ ...nuevaTemporada, nombre: e.target.value })} className={`${campo} md:col-span-2`} />
              <input required type="date" value={nuevaTemporada.fechaInicio} aria-label="Fecha de inicio"
                onChange={e => setNuevaTemporada({ ...nuevaTemporada, fechaInicio: e.target.value })} className={campo} />
              <input required type="date" value={nuevaTemporada.fechaFin} min={nuevaTemporada.fechaInicio} aria-label="Fecha de fin"
                onChange={e => setNuevaTemporada({ ...nuevaTemporada, fechaFin: e.target.value })} className={campo} />
              <div className="flex gap-2">
                <input required type="number" min="-50" max="100" placeholder="%" value={nuevaTemporada.porcentaje}
                  onChange={e => setNuevaTemporada({ ...nuevaTemporada, porcentaje: e.target.value })} className={campo} />
                <button type="submit" className="px-3 rounded-xl bg-slate-900 text-white text-xs font-bold">Crear</button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="p-3 text-left">Fechas</th><th className="p-3 text-left">Nombre</th><th className="p-3 text-left">Ajuste</th><th className="p-3 text-left">Aprobó</th><th className="p-3 text-left">Estado</th><th className="p-3" /></tr>
              </thead>
              <tbody>
                {temporadas.map(t => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="p-3 whitespace-nowrap">{t.fechaInicio} al {t.fechaFin}</td>
                    <td className="p-3 font-semibold text-slate-900">{t.nombre}</td>
                    <td className="p-3">{t.porcentaje > 0 ? '+' : ''}{t.porcentaje} %{t.tipoHabitacion ? ` · ${t.tipoHabitacion}` : ''}</td>
                    <td className="p-3">{t.creadoPor}</td>
                    <td className="p-3">{t.activa ? 'Activa' : 'Desactivada'}</td>
                    <td className="p-3 text-right">
                      {esAdmin && t.activa && (
                        <button type="button" onClick={() => desactivar(t.id)} className="text-[11px] font-semibold text-rose-700 hover:underline">Desactivar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {pestana === 'historial' && (
        <section className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-left">Fechas</th><th className="p-3 text-left">Sugerido</th><th className="p-3 text-left">Aplicado</th>
                <th className="p-3 text-left">Estado</th><th className="p-3 text-left">Decidió</th><th className="p-3 text-left">Comentario</th>
                <th className="p-3 text-left">Ocupación prevista / real</th>
              </tr>
            </thead>
            <tbody>
              {historial.map(h => (
                <tr key={h.id} className="border-t border-slate-100 align-top">
                  <td className="p-3 whitespace-nowrap">{h.fechaInicio} al {h.fechaFin}<br /><span className="text-slate-500">{h.eventos}</span></td>
                  <td className="p-3">+{h.porcentaje} %</td>
                  <td className="p-3">{h.porcentajeAplicado != null ? `+${h.porcentajeAplicado} %` : '—'}</td>
                  <td className="p-3"><Estado estado={h.estado} /></td>
                  <td className="p-3">{h.decididoPor || '—'}</td>
                  <td className="p-3 text-slate-600">{h.comentarioDecision || '—'}</td>
                  <td className="p-3">{h.ocupacionPrevista ?? 0} % / {h.ocupacionReal != null ? `${h.ocupacionReal} %` : 'pendiente'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
