'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Search,
  Bed,
  Sun,
  Wifi,
  Coffee,
  Compass,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Lock,
  ArrowRight,
  CreditCard,
  UserPlus,
  CalendarCheck2,
  CheckCircle2,
  Star
} from 'lucide-react';
import { HabitacionAPI, PublicoAPI } from '../lib/api';
import ChatHuesped from './components/ChatHuesped';
import EncabezadoPublico from './components/publico/EncabezadoPublico';
import ReservaClienteModal, { hoyISO, sumarDias } from './components/publico/ReservaClienteModal';
import { ToastProvider } from './components/Toast';

// Portada: si existe public/portada.jpg (foto real del hotel) se muestra encima; si no, la ilustración incluida.
const FONDO_PORTADA = "url('/portada.jpg'), url('/portada-huacachina.svg')";
const IMAGEN_HABITACION = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=70';
const TIPOS = { INDIVIDUAL: 'Individual', DOBLE: 'Doble', MATRIMONIAL: 'Matrimonial', SUITE: 'Suite', FAMILIAR: 'Familiar' };
const SERVICIOS_BASE = [
  { icono: Wifi, titulo: 'WiFi gratis', texto: 'Conexión en habitaciones y áreas comunes.' },
  { icono: Coffee, titulo: 'Desayuno', texto: 'Para empezar el día con energía.' },
  { icono: Compass, titulo: 'Tours', texto: 'Areneros, sandboard y bodegas de pisco.' },
  { icono: ShieldCheck, titulo: 'Recepción 24 h', texto: 'Atención y seguridad durante tu estadía.' }
];

const fechaCorta = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
const soles = (n) => `S/ ${Number(n || 0).toFixed(2)}`;

export default function Home() {
  return (
    <ToastProvider>
      <HotelLanding />
    </ToastProvider>
  );
}

function HotelLanding() {
  const [hotel, setHotel] = useState(null);
  const [entrada, setEntrada] = useState(hoyISO());
  const [salida, setSalida] = useState(sumarDias(hoyISO(), 2));
  const [personas, setPersonas] = useState(2);
  const [busqueda, setBusqueda] = useState({ entrada: hoyISO(), salida: sumarDias(hoyISO(), 2), personas: 2 });
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');
  const [soloLibres, setSoloLibres] = useState(false);
  const [seleccion, setSeleccion] = useState(null);

  const buscar = useCallback(async (e, s, p) => {
    setCargando(true);
    setErrorBusqueda('');
    try {
      const filas = await PublicoAPI.disponibilidad(e, s, p);
      setResultados(filas || []);
      setBusqueda({ entrada: e, salida: s, personas: p });
      return filas || [];
    } catch (err) {
      // Si la búsqueda por fechas falla, se muestran las habitaciones con su precio base
      setErrorBusqueda(err.message);
      const noches = Math.max(1, Math.round((new Date(s) - new Date(e)) / 86400000));
      const habs = await HabitacionAPI.getAll().catch(() => []);
      const filas = (habs || []).map((h) => ({
        habitacion: h,
        disponible: h.estado !== 'MANTENIMIENTO' && h.capacidad >= p,
        motivo: null,
        noches,
        total: Number(h.precioPorNoche) * noches,
        ajusteTemporada: 0
      }));
      setResultados(filas);
      return filas;
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    PublicoAPI.hotel().then(setHotel).catch(() => setHotel(null));

    // Al volver del ingreso o registro se retoma la reserva que el cliente había elegido
    const params = new URLSearchParams(window.location.search);
    const e = params.get('entrada') && params.get('entrada') >= hoyISO() ? params.get('entrada') : hoyISO();
    const s = params.get('salida') && params.get('salida') > e ? params.get('salida') : sumarDias(e, 2);
    const p = Number(params.get('personas')) || 2;
    setEntrada(e);
    setSalida(s);
    setPersonas(p);
    buscar(e, s, p).then((filas) => {
      const habId = params.get('hab');
      if (!habId) return;
      const fila = filas.find((f) => String(f.habitacion.id) === habId);
      if (fila) setSeleccion(fila.habitacion);
      window.history.replaceState(null, '', '/#habitaciones');
    });
  }, [buscar]);

  const enviarBusqueda = (ev) => {
    ev.preventDefault();
    buscar(entrada, salida, personas);
    document.getElementById('habitaciones')?.scrollIntoView({ behavior: 'smooth' });
  };

  const visibles = useMemo(() => resultados
    .filter((f) => tipoFiltro === 'TODOS' || f.habitacion.tipo === tipoFiltro)
    .filter((f) => !soloLibres || f.disponible)
    .sort((a, b) => Number(b.disponible) - Number(a.disponible)), [resultados, tipoFiltro, soloLibres]);

  const libres = resultados.filter((f) => f.disponible).length;
  const noches = Math.max(1, Math.round((new Date(busqueda.salida) - new Date(busqueda.entrada)) / 86400000));
  const nombreHotel = hotel?.nombreHotel || 'Hotel Princes Ica';
  const servicios = (hotel?.servicios || '')
    .split(/[\n,;]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <EncabezadoPublico transparente />

      {/* ===== Banner principal con el nombre del hotel ===== */}
      <section className="relative -mt-16 pt-16 min-h-[640px] flex items-end text-white">
        <div className="absolute inset-0 bg-slate-900 bg-cover bg-center" style={{ backgroundImage: FONDO_PORTADA }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-24">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur">
            <Sun className="w-4 h-4 text-amber-300" /> Huacachina · Ica, Perú
          </span>
          <h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-3xl">
            {nombreHotel}
          </h1>
          <p className="mt-4 text-lg text-slate-200 max-w-2xl">
            {hotel?.descripcion || 'Descansa junto al oasis de Huacachina, entre dunas, viñedos y el mejor sol de Ica.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15"><Clock className="w-3.5 h-3.5 text-amber-300" /> Check-in {hotel?.horaCheckIn || '14:00'}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15"><Clock className="w-3.5 h-3.5 text-amber-300" /> Check-out {hotel?.horaCheckOut || '12:00'}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15"><CreditCard className="w-3.5 h-3.5 text-amber-300" /> Pago en línea o en recepción</span>
          </div>

          <form onSubmit={enviarBusqueda} className="mt-8 bg-white text-slate-800 rounded-2xl shadow-2xl p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_auto] gap-2">
            <label className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50">
              <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Llegada</span>
                <input type="date" value={entrada} min={hoyISO()} required
                  onChange={(e) => { setEntrada(e.target.value); if (salida <= e.target.value) setSalida(sumarDias(e.target.value, 1)); }}
                  className="w-full bg-transparent text-sm font-semibold focus:outline-none" />
              </span>
            </label>
            <label className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50">
              <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Salida</span>
                <input type="date" value={salida} min={sumarDias(entrada, 1)} required onChange={(e) => setSalida(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold focus:outline-none" />
              </span>
            </label>
            <label className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50">
              <Users className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Huéspedes</span>
                <select value={personas} onChange={(e) => setPersonas(Number(e.target.value))} className="w-full bg-transparent text-sm font-semibold focus:outline-none">
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}
                </select>
              </span>
            </label>
            <button type="submit" className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition">
              <Search className="w-4 h-4" /> Buscar
            </button>
          </form>
        </div>
      </section>

      {/* ===== Habitaciones con disponibilidad real por fechas ===== */}
      <section id="habitaciones" className="py-14 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Habitaciones</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                {cargando ? 'Buscando disponibilidad…' : `${libres} ${libres === 1 ? 'habitación libre' : 'habitaciones libres'}`}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Del {fechaCorta(busqueda.entrada)} al {fechaCorta(busqueda.salida)} · {noches} noche{noches === 1 ? '' : 's'} · {busqueda.personas} {busqueda.personas === 1 ? 'persona' : 'personas'}
              </p>
              {errorBusqueda && <p className="text-xs text-rose-600 mt-1">{errorBusqueda}. Mostramos precios base.</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['TODOS', ...Object.keys(TIPOS)].map((t) => (
                <button key={t} onClick={() => setTipoFiltro(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${tipoFiltro === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
                  {t === 'TODOS' ? 'Todas' : TIPOS[t]}
                </button>
              ))}
              <label className="ml-1 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <input type="checkbox" checked={soloLibres} onChange={(e) => setSoloLibres(e.target.checked)} /> Solo libres
              </label>
            </div>
          </div>

          {cargando ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                  <div className="h-52 bg-slate-200" />
                  <div className="p-5 space-y-3"><div className="h-4 bg-slate-200 rounded w-2/3" /><div className="h-3 bg-slate-100 rounded" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
                </div>
              ))}
            </div>
          ) : visibles.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
              <Bed className="w-10 h-10 mx-auto text-slate-300" />
              <p className="mt-3 font-bold text-slate-800">No hay habitaciones con esos filtros</p>
              <p className="text-sm text-slate-500">Prueba otras fechas, menos personas u otro tipo de habitación.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibles.map(({ habitacion: h, disponible, motivo, total, ajusteTemporada }) => {
                const extras = (h.caracteristicas || '').split(/[,;]+/).map((x) => x.trim()).filter(Boolean).slice(0, 4);
                return (
                  <article key={h.id} className={`group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition flex flex-col ${disponible ? 'hover:shadow-lg hover:-translate-y-0.5' : 'opacity-70'}`}>
                    <div className="relative h-52 bg-slate-200 overflow-hidden">
                      <img src={h.imagenUrl || IMAGEN_HABITACION} alt={`Habitación ${h.numero}`} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 text-slate-800 text-xs font-bold rounded-full">Hab. {h.numero}{h.piso ? ` · Piso ${h.piso}` : ''}</span>
                      <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full ${disponible ? 'bg-emerald-500 text-white' : 'bg-slate-800/90 text-white'}`}>
                        {disponible ? 'Disponible' : motivo || 'No disponible'}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-lg text-slate-900">{TIPOS[h.tipo] || h.tipo}</h3>
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-amber-500" /> Hasta {h.capacidad}</span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{h.descripcion || 'Habitación cómoda con lo esencial para una buena estadía.'}</p>
                      {extras.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {extras.map((x) => <span key={x} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{x}</span>)}
                        </div>
                      )}
                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-slate-500">{soles(h.precioPorNoche)} por noche</p>
                          <p className="text-xl font-black text-slate-900">{soles(total)}</p>
                          <p className="text-[11px] text-slate-500">
                            Total {noches} noche{noches === 1 ? '' : 's'}{Number(ajusteTemporada) > 0 ? ' · incluye temporada' : ''}
                          </p>
                        </div>
                        <button onClick={() => setSeleccion(h)} disabled={!disponible}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-1.5">
                          Reservar <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== Cómo reservar ===== */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 text-center">Reserva en tres pasos</h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {[
              { icono: CalendarCheck2, titulo: 'Elige fechas y habitación', texto: 'Ves solo lo que está libre y el precio total de tu estadía.' },
              { icono: UserPlus, titulo: 'Ingresa o crea tu cuenta', texto: 'Tus datos se guardan una vez; la próxima reserva es inmediata.' },
              { icono: CreditCard, titulo: 'Paga en línea o al llegar', texto: 'Con Mercado Pago tu reserva queda confirmada al instante.' }
            ].map((paso, i) => (
              <div key={paso.titulo} className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">{i + 1}</span>
                  <paso.icono className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{paso.titulo}</h3>
                <p className="mt-1 text-sm text-slate-600">{paso.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Servicios (los define el administrador en Configuración IA) ===== */}
      <section id="servicios" className="py-14 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Servicios</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Todo para disfrutar Ica</h2>
          </div>
          {servicios.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              {servicios.map((s) => (
                <span key={s} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {s}
                </span>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SERVICIOS_BASE.map((s) => (
                <div key={s.titulo} className="p-5 bg-white border border-slate-200 rounded-2xl">
                  <s.icono className="w-6 h-6 text-amber-500" />
                  <h3 className="mt-3 font-bold text-slate-900">{s.titulo}</h3>
                  <p className="mt-1 text-sm text-slate-600">{s.texto}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-8 text-center text-sm text-slate-500 flex items-center justify-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500" /> ¿Dudas? Escríbenos en el chat: respondemos las 24 horas, en tu idioma.
          </p>
        </div>
      </section>

      <footer id="contacto" className="bg-slate-950 text-slate-300 pt-12 pb-8 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-black text-white text-lg">{nombreHotel}</p>
            <p className="mt-2 text-sm text-slate-400">Alojamiento en Huacachina, Ica.</p>
          </div>
          <div className="space-y-2 text-sm">
            <h4 className="font-bold text-white uppercase text-xs tracking-[0.18em] mb-3">Contacto</h4>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" /> {hotel?.direccion || 'Ica - Perú'}</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-amber-400" /> {hotel?.telefono || '+51 956 123 456'}</p>
            {hotel?.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-400" /> {hotel.email}</p>}
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-xs tracking-[0.18em] mb-3">Tu cuenta</h4>
            <Link href="/cuenta/reservas" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-sm transition">
              Mis reservas <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/VistaPersonal/login" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300">
              <Lock className="w-3 h-3" /> Acceso del personal
            </Link>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-slate-600">© {new Date().getFullYear()} {nombreHotel}</p>
      </footer>

      <ReservaClienteModal
        abierto={Boolean(seleccion)}
        onCerrar={() => setSeleccion(null)}
        habitacion={seleccion}
        entradaInicial={busqueda.entrada}
        salidaInicial={busqueda.salida}
        personasIniciales={busqueda.personas}
        onReservada={() => buscar(busqueda.entrada, busqueda.salida, busqueda.personas)}
      />

      <ChatHuesped />
    </div>
  );
}
