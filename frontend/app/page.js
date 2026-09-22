'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Hotel,
  Calendar,
  Users,
  Search,
  Bed,
  CheckCircle2,
  Sparkles,
  Wifi,
  Tv,
  Coffee,
  Sun,
  Compass,
  Wine,
  Phone,
  MapPin,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowRight,
  Lock
} from 'lucide-react';
import { HabitacionAPI, ReservacionAPI, HuespedAPI } from '../lib/api';
import ModalReserva from './components/ModalReserva';
import ModalHuesped from './components/ModalHuesped';
import { ToastProvider, useToast } from './components/Toast';

export default function Home() {
  return (
    <ToastProvider>
      <HotelLandingContent />
    </ToastProvider>
  );
}

function HotelLandingContent() {
  const { addToast } = useToast();
  const [habitaciones, setHabitaciones] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [checkIn, setCheckIn] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(() => new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
  const [huespedesCount, setHuespedesCount] = useState(2);
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');
  const [modalReservaOpen, setModalReservaOpen] = useState(false);
  const [habSeleccionada, setHabSeleccionada] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [h, hu] = await Promise.all([
          HabitacionAPI.getAll(),
          HuespedAPI.getAll()
        ]);
        setHabitaciones(h || []);
        setHuespedes(hu || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleReservarHab = (hab) => {
    setHabSeleccionada(hab);
    setModalReservaOpen(true);
  };

  const handleGuardarReserva = async (payload) => {
    await ReservacionAPI.create(payload);
    addToast('¡Tu solicitud de reservación ha sido registrada con éxito!', 'success');
  };

  const habitacionesFiltradas = habitaciones.filter((h) => {
    if (tipoFiltro !== 'TODOS' && h.tipo !== tipoFiltro) return false;
    if (huespedesCount && h.capacidad < Number(huespedesCount)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 rounded-xl text-slate-900 shadow-sm">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block">Hotel Princes</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em] block">
                Huacachina • Ica
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#habitaciones" className="hover:text-slate-900 transition">Habitaciones</a>
            <a href="#servicios" className="hover:text-slate-900 transition">Servicios</a>
            <a href="#contacto" className="hover:text-slate-900 transition">Contacto</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/VistaPersonal"
              className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-xs font-semibold transition hover:bg-slate-50"
            >
              <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Personal</span>
            </Link>
            <a
              href="#habitaciones"
              className="hidden sm:inline-flex px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg text-xs font-bold transition"
            >
              Reservar
            </a>
          </div>
        </div>
      </header>

      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold mb-6">
            <Sun className="w-4 h-4 text-amber-500" /> Alojamiento en Huacachina
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Hotel Princes Ica
              </h1>
              <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
                Un lugar cómodo para descansar, alojarse y disfrutar del turismo de Ica de forma simple y tranquila.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
                  <Wifi className="w-3.5 h-3.5 text-slate-700" /> WiFi
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
                  <Tv className="w-3.5 h-3.5 text-slate-700" /> TV
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
                  <Coffee className="w-3.5 h-3.5 text-slate-700" /> Desayuno
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">Check in</label>
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-sm">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="bg-transparent w-full focus:outline-none text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">Check out</label>
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-sm">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-transparent w-full focus:outline-none text-slate-700"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">Huéspedes</label>
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-sm">
                    <Users className="w-4 h-4 text-amber-500" />
                    <select
                      value={huespedesCount}
                      onChange={(e) => setHuespedesCount(e.target.value)}
                      className="bg-transparent w-full focus:outline-none text-slate-700"
                    >
                      <option value={1}>1 Huésped</option>
                      <option value={2}>2 Huéspedes</option>
                      <option value={3}>3 Huéspedes</option>
                      <option value={4}>4+ Personas</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <a
                    href="#habitaciones"
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Search className="w-4 h-4" /> Buscar disponibilidad
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="habitaciones" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Habitaciones</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
                Disponibilidad del hotel
              </h2>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['TODOS', 'INDIVIDUAL', 'DOBLE', 'MATRIMONIAL', 'SUITE', 'FAMILIAR'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoFiltro(t)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                    tipoFiltro === t
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitacionesFiltradas.map((hab) => {
              const isLibre = hab.estado === 'DISPONIBLE';

              return (
                <div
                  key={hab.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="relative h-48 w-full bg-slate-200">
                    <img
                      src={hab.imagenUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                      alt={`Habitación ${hab.numero}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 text-slate-700 text-[10px] font-bold rounded-full border border-slate-200">
                        Hab. {hab.numero}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-lg text-slate-900">Tipo {hab.tipo}</h3>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-500" /> {hab.capacidad}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {hab.descripcion || 'Habitación cómoda con lo esencial para una buena estadía.'}
                    </p>

                    <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-3">
                      <span className="font-bold text-slate-900">S/ {Number(hab.precioPorNoche).toFixed(2)}</span>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                        isLibre ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isLibre ? 'Disponible' : 'Ocupada'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReservarHab(hab)}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                    >
                      <Bed className="w-4 h-4" /> Reservar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="servicios" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Servicios</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              Lo básico para una buena visita
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="p-3 bg-white border border-slate-200 rounded-xl w-max mb-3">
                <Compass className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Tours</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">Opciones para explorar Huacachina y sus alrededores.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="p-3 bg-white border border-slate-200 rounded-xl w-max mb-3">
                <Wifi className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Internet</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">Conexión estable para uso diario.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="p-3 bg-white border border-slate-200 rounded-xl w-max mb-3">
                <Coffee className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Desayuno</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">Servicio sencillo para iniciar el día.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="p-3 bg-white border border-slate-200 rounded-xl w-max mb-3">
                <ShieldCheck className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Seguridad</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">Atención y control para una estadía tranquila.</p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contacto" className="bg-slate-900 text-slate-300 py-10 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-400 rounded-lg text-slate-900">
                <Hotel className="w-4 h-4" />
              </div>
              <span className="font-bold text-white">Hotel Princes Ica</span>
            </div>
            <p className="text-sm text-slate-400">Alojamiento básico y cómodo en Huacachina, Ica.</p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-[0.18em] mb-3">Contacto</h4>
            <p className="text-sm mb-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" /> Ica - Perú</p>
            <p className="text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-amber-400" /> +51 956 123 456</p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-[0.18em] mb-3">Personal</h4>
            <Link href="/VistaPersonal" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg font-bold text-sm transition">
              Ingresar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </footer>

      <ModalReserva
        isOpen={modalReservaOpen}
        onClose={() => setModalReservaOpen(false)}
        onSave={handleGuardarReserva}
        habitacionPreseleccionada={habSeleccionada}
        habitaciones={habitaciones}
        huespedes={huespedes}
      />
    </div>
  );
}