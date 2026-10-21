'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BedDouble,
  CalendarDays,
  CreditCard,
  Users,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Save,
  Search,
  RefreshCw
} from 'lucide-react';
import { ClienteAPI } from '../../../lib/cliente';
import { useToast } from '../../components/Toast';

const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente de confirmación', clase: 'bg-amber-100 text-amber-800' },
  CONFIRMADA: { texto: 'Confirmada', clase: 'bg-emerald-100 text-emerald-800' },
  EN_CURSO: { texto: 'En curso', clase: 'bg-sky-100 text-sky-800' },
  COMPLETADA: { texto: 'Completada', clase: 'bg-slate-200 text-slate-700' },
  CANCELADA: { texto: 'Cancelada', clase: 'bg-rose-100 text-rose-700' }
};

const hoyISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const formatoFecha = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const noches = (r) => Math.max(1, Math.round((new Date(r.fechaSalida) - new Date(r.fechaEntrada)) / 86400000));

export default function MisReservasPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [perfil, setPerfil] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [contacto, setContacto] = useState({ telefono: '', nacionalidad: '', ciudadProcedencia: '' });
  const [porCancelar, setPorCancelar] = useState(null);
  const [procesando, setProcesando] = useState(null);

  const manejarError = useCallback((err) => {
    if (err.status === 401) {
      router.replace('/cuenta?volver=/cuenta/reservas');
      return;
    }
    addToast(err.message, 'error');
  }, [router, addToast]);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [p, r] = await Promise.all([ClienteAPI.perfil(), ClienteAPI.misReservas()]);
      setPerfil(p);
      setContacto({ telefono: p.telefono || '', nacionalidad: p.nacionalidad || '', ciudadProcedencia: p.ciudadProcedencia || '' });
      setReservas(r || []);
    } catch (err) {
      manejarError(err);
    } finally {
      setCargando(false);
    }
  }, [manejarError]);

  useEffect(() => {
    if (!ClienteAPI.isAuthenticated()) {
      router.replace('/cuenta?volver=/cuenta/reservas');
      return;
    }
    cargar();
  }, [router, cargar]);

  const guardarContacto = async () => {
    try {
      const p = await ClienteAPI.actualizarPerfil(contacto);
      setPerfil(p);
      setEditando(false);
      addToast('Datos actualizados', 'success');
    } catch (err) {
      manejarError(err);
    }
  };

  const pagar = async (r) => {
    setProcesando(r.id);
    try {
      const pago = await ClienteAPI.pagar(r.codigoReserva);
      if (pago?.urlPago) {
        window.location.href = pago.urlPago;
        return;
      }
      addToast('No se recibió el enlace de pago. Intente de nuevo.', 'error');
    } catch (err) {
      addToast(err.message || 'El pago en línea no está disponible; puede pagar en recepción.', 'warning');
    } finally {
      setProcesando(null);
    }
  };

  const cancelar = async () => {
    const r = porCancelar;
    setPorCancelar(null);
    setProcesando(r.id);
    try {
      await ClienteAPI.cancelar(r.id);
      addToast(`Reserva ${r.codigoReserva} cancelada`, 'success');
      await cargar();
    } catch (err) {
      manejarError(err);
    } finally {
      setProcesando(null);
    }
  };

  const hoy = hoyISO();
  const activas = reservas.filter((r) => ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO'].includes(r.estado));
  const historial = reservas.filter((r) => !['PENDIENTE', 'CONFIRMADA', 'EN_CURSO'].includes(r.estado));

  const Tarjeta = ({ r }) => {
    const estado = ESTADOS[r.estado] || { texto: r.estado, clase: 'bg-slate-100 text-slate-700' };
    const saldo = Number(r.precioTotal || 0) - Number(r.adelanto || 0);
    const puedePagar = ['PENDIENTE', 'CONFIRMADA'].includes(r.estado) && saldo > 0 && r.fechaSalida >= hoy;
    const puedeCancelar = ['PENDIENTE', 'CONFIRMADA'].includes(r.estado) && r.fechaEntrada > hoy && Number(r.adelanto || 0) === 0;
    return (
      <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
        <div className="sm:w-44 h-32 sm:h-auto bg-slate-200 shrink-0">
          <img
            src={r.habitacion?.imagenUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=70'}
            alt={`Habitación ${r.habitacion?.numero || ''}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-mono text-slate-500">{r.codigoReserva}</p>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-amber-500" /> Habitación {r.habitacion?.numero} · {r.habitacion?.tipo}
              </h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${estado.clase}`}>{estado.texto}</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-sm text-slate-600">
            <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-slate-400" /> {formatoFecha(r.fechaEntrada)}</span>
            <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-slate-400" /> {formatoFecha(r.fechaSalida)}</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> {r.numeroPersonas} pers. · {noches(r)} noche{noches(r) > 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="text-sm">
              <span className="text-slate-500">Total </span>
              <span className="font-black text-slate-900">S/ {Number(r.precioTotal || 0).toFixed(2)}</span>
              {Number(r.adelanto || 0) > 0 && (
                <span className="block text-xs text-emerald-700 font-semibold">Pagado S/ {Number(r.adelanto).toFixed(2)} · Saldo S/ {saldo.toFixed(2)}</span>
              )}
            </div>
            <div className="flex gap-2">
              {puedeCancelar && (
                <button onClick={() => setPorCancelar(r)} disabled={procesando === r.id}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
                  Cancelar
                </button>
              )}
              {puedePagar && (
                <button onClick={() => pagar(r)} disabled={procesando === r.id}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  <CreditCard className="w-4 h-4" /> {procesando === r.id ? 'Abriendo…' : 'Pagar en línea'}
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  if (cargando && !perfil) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">Cargando tu cuenta…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_300px] gap-6 items-start">
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Mis reservas</h1>
            <p className="text-sm text-slate-500">Aquí ves el estado de cada reserva y puedes pagarla en línea.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={cargar} className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50" title="Actualizar">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link href="/#habitaciones" className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2">
              <Search className="w-4 h-4" /> Nueva reserva
            </Link>
          </div>
        </div>

        {activas.length === 0 && historial.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
            <BedDouble className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-800">Aún no tienes reservas</p>
            <p className="text-sm text-slate-500">Elige tus fechas y la habitación que más te guste.</p>
            <Link href="/#habitaciones" className="inline-block px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm">Ver habitaciones</Link>
          </div>
        ) : (
          <>
            {activas.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Próximas y en curso</h2>
                {activas.map((r) => <Tarjeta key={r.id} r={r} />)}
              </div>
            )}
            {historial.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Historial</h2>
                {historial.map((r) => <Tarjeta key={r.id} r={r} />)}
              </div>
            )}
          </>
        )}
      </section>

      <aside className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Mis datos</p>
          <p className="font-bold text-slate-900 mt-1">{perfil?.nombreCompleto}</p>
          <p className="text-xs text-slate-500">{perfil?.tipoDocumento} {perfil?.numeroDocumento}</p>
        </div>
        <p className="text-sm text-slate-600 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {perfil?.email}</p>
        {editando ? (
          <div className="space-y-3">
            {[
              ['telefono', 'Celular'],
              ['nacionalidad', 'Nacionalidad'],
              ['ciudadProcedencia', 'Ciudad de procedencia']
            ].map(([clave, etiqueta]) => (
              <label key={clave} className="block text-sm">
                <span className="font-semibold text-slate-700">{etiqueta}</span>
                <input
                  value={contacto[clave]}
                  onChange={(e) => setContacto((c) => ({ ...c, [clave]: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </label>
            ))}
            <div className="flex gap-2">
              <button onClick={() => setEditando(false)} className="flex-1 py-2 rounded-xl border border-slate-300 text-sm font-semibold">Cancelar</button>
              <button onClick={guardarContacto} className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-1">
                <Save className="w-4 h-4" /> Guardar
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {perfil?.telefono || 'Sin celular'}</p>
            <p className="text-sm text-slate-600 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {[perfil?.ciudadProcedencia, perfil?.nacionalidad].filter(Boolean).join(' · ') || 'Sin procedencia'}</p>
            <button onClick={() => setEditando(true)} className="w-full py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50">
              <Edit2 className="w-4 h-4" /> Editar contacto
            </button>
          </>
        )}
        <p className="text-xs text-slate-400">Para corregir tu nombre o documento, acércate a recepción.</p>
      </aside>

      {porCancelar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <XCircle className="w-10 h-10 text-rose-500" />
            <h3 className="font-bold text-lg text-slate-900">¿Cancelar la reserva {porCancelar.codigoReserva}?</h3>
            <p className="text-sm text-slate-600">
              Habitación {porCancelar.habitacion?.numero}, del {formatoFecha(porCancelar.fechaEntrada)} al {formatoFecha(porCancelar.fechaSalida)}. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPorCancelar(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">Volver</button>
              <button onClick={cancelar} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold">Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
