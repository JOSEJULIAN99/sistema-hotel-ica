'use client';

import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Server, AlertTriangle } from 'lucide-react';
import { MonitoreoAPI } from '../../../lib/api';

// Panel de monitoreo del administrador (RF-15). Se actualiza solo cada 30 segundos.

const COLOR = {
  OK: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ALERTA: 'bg-amber-100 text-amber-800 border-amber-200',
  ERROR: 'bg-rose-100 text-rose-800 border-rose-200',
  DESACTIVADO: 'bg-slate-100 text-slate-600 border-slate-200'
};

function Indicador({ etiqueta, valor, alerta }) {
  return (
    <div className={`p-4 rounded-2xl border bg-white ${alerta ? 'border-amber-300' : 'border-slate-200'}`}>
      <p className="text-[11px] font-semibold text-slate-500">{etiqueta}</p>
      <p className="text-2xl font-black text-slate-900">{valor}</p>
    </div>
  );
}

export default function MonitoreoPage() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      setDatos(await MonitoreoAPI.resumen());
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudo consultar el estado del sistema');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 30000);
    return () => clearInterval(id);
  }, []);

  const op = datos?.operacion;
  const ind = op?.indicadores;
  const act = datos?.actividad;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950"><Activity className="w-6 h-6" /></div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Monitoreo del sistema</h1>
            <p className="text-xs text-slate-500">
              {datos ? `Actualizado ${String(datos.generado).replace('T', ' ').slice(0, 19)} · se refresca cada 30 s` : 'Cargando…'}
            </p>
          </div>
        </div>
        <button type="button" onClick={cargar} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700">
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </header>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">{error}</div>}

      {datos && (
        <>
          <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {datos.servicios.map(s => (
              <div key={s.nombre} className={`p-4 rounded-2xl border ${COLOR[s.estado] || COLOR.DESACTIVADO}`}>
                <p className="text-xs font-bold">{s.nombre}</p>
                <p className="text-sm font-black">{s.estado}{s.latenciaMs != null ? ` · ${s.latenciaMs} ms` : ''}</p>
                <p className="text-[11px] mt-1 opacity-80">{s.detalle}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Indicador etiqueta="Ocupación actual" valor={`${ind?.porcentajeOcupacion ?? 0} %`} />
            <Indicador etiqueta="Check-in / check-out hoy" valor={`${ind?.checkInsHoy ?? 0} / ${ind?.checkOutsHoy ?? 0}`} />
            <Indicador etiqueta="Ingresos de hoy" valor={`S/ ${Number(ind?.ingresosHoy ?? 0).toFixed(2)}`} />
            <Indicador etiqueta="Ingresos del mes" valor={`S/ ${Number(ind?.ingresosMes ?? 0).toFixed(2)}`} />
            <Indicador etiqueta="Limpiezas abiertas" valor={ind?.tareasLimpiezaPendientes ?? 0} alerta={(ind?.tareasLimpiezaPendientes ?? 0) > 5} />
            <Indicador etiqueta="Incidencias abiertas" valor={op.incidenciasAbiertas} alerta={op.incidenciasAbiertas > 0} />
            <Indicador etiqueta="Tarifas por decidir" valor={op.tarifasPorDecidir} alerta={op.tarifasPorDecidir > 0} />
            <Indicador etiqueta="Pagos en línea pendientes / aprobados" valor={`${op.pagosOnlinePendientes} / ${op.pagosOnlineAprobados}`} />
          </section>

          <section className="grid lg:grid-cols-3 gap-3">
            <Indicador etiqueta="Operaciones registradas (24 h)" valor={act.operaciones24h} />
            <Indicador etiqueta="Rechazos 4xx (24 h)" valor={act.rechazos24h} />
            <Indicador etiqueta="Errores del servidor 5xx (24 h)" valor={act.erroresServidor24h} alerta={act.erroresServidor24h > 0} />
          </section>

          {act.ultimosErrores.length > 0 && (
            <section className="bg-white rounded-2xl border border-amber-200 p-4 space-y-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><AlertTriangle className="w-4 h-4 text-amber-600" /> Errores y rechazos recientes</h2>
              <ul className="text-xs space-y-1">
                {act.ultimosErrores.map(e => (
                  <li key={e.id} className="flex flex-wrap gap-2">
                    <span className="font-mono font-bold">{e.estadoHttp}</span>
                    <span>{e.metodo} {e.ruta}</span>
                    <span className="text-slate-500">{e.usuario} · {String(e.fecha).replace('T', ' ').slice(0, 19)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
            <h2 className="p-4 pb-0 text-sm font-bold text-slate-900">Actividad del personal</h2>
            <table className="w-full text-xs mt-2">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="p-3 text-left">Fecha</th><th className="p-3 text-left">Usuario</th><th className="p-3 text-left">Acción</th><th className="p-3 text-left">Resultado</th><th className="p-3 text-left">Duración</th></tr>
              </thead>
              <tbody>
                {act.ultimas.map(a => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="p-3 whitespace-nowrap">{String(a.fecha).replace('T', ' ').slice(0, 19)}</td>
                    <td className="p-3">{a.usuario}{a.rol ? ` (${a.rol})` : ''}</td>
                    <td className="p-3 font-mono">{a.metodo} {a.ruta}</td>
                    <td className={`p-3 font-bold ${a.estadoHttp >= 500 ? 'text-rose-700' : a.estadoHttp >= 400 ? 'text-amber-700' : 'text-emerald-700'}`}>{a.estadoHttp}</td>
                    <td className="p-3">{a.duracionMs != null ? `${a.duracionMs} ms` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white text-xs text-slate-600">
            <Server className="w-4 h-4" />
            <span>Encendido hace {datos.servidor.encendidoMinutos} min</span>
            <span>Memoria {datos.servidor.memoriaUsadaMb} / {datos.servidor.memoriaMaximaMb} MB</span>
            <span>Java {datos.servidor.java} · {datos.servidor.procesadores} CPU</span>
          </section>
        </>
      )}
    </div>
  );
}
