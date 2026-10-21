'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hotel, CalendarCheck2, LogOut, Menu, X, User } from 'lucide-react';
import { ClienteAPI, EVENTO_SESION_CLIENTE } from '../../../lib/cliente';

// Encabezado de la web pública: el cliente ve su cuenta; el acceso del personal va en el pie de página.
export default function EncabezadoPublico({ transparente = false }) {
  const router = useRouter();
  const [cliente, setCliente] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const actualizar = () => setCliente(ClienteAPI.getCliente());
    actualizar();
    window.addEventListener(EVENTO_SESION_CLIENTE, actualizar);
    window.addEventListener('storage', actualizar);
    return () => {
      window.removeEventListener(EVENTO_SESION_CLIENTE, actualizar);
      window.removeEventListener('storage', actualizar);
    };
  }, []);

  const salir = () => {
    ClienteAPI.logout();
    setCliente(null);
    setMenuAbierto(false);
    router.push('/');
  };

  const primerNombre = cliente?.nombres ? cliente.nombres.split(' ')[0] : 'Mi cuenta';
  const fondo = transparente
    ? 'bg-slate-950/40 border-white/10 text-white'
    : 'bg-white/95 border-slate-200 text-slate-900';
  const textoSuave = transparente ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${fondo}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="p-2 bg-amber-400 rounded-xl text-slate-900 shadow-sm">
            <Hotel className="w-5 h-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-bold tracking-tight">Hotel Princes</span>
            <span className={`block text-[10px] font-semibold uppercase tracking-[0.18em] ${transparente ? 'text-amber-300' : 'text-amber-600'}`}>
              Huacachina · Ica
            </span>
          </span>
        </Link>

        <nav className={`hidden md:flex items-center gap-6 text-sm font-medium ${textoSuave}`}>
          <Link href="/#habitaciones" className="transition">Habitaciones</Link>
          <Link href="/#servicios" className="transition">Servicios</Link>
          <Link href="/#contacto" className="transition">Contacto</Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {cliente ? (
            <>
              <Link
                href="/cuenta/reservas"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-sm font-bold transition flex items-center gap-2"
              >
                <CalendarCheck2 className="w-4 h-4" /> Mis reservas
              </Link>
              <span className={`text-sm font-semibold px-2 flex items-center gap-1.5 ${textoSuave}`}>
                <User className="w-4 h-4" /> {primerNombre}
              </span>
              <button onClick={salir} className={`p-2 rounded-xl transition ${textoSuave}`} title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/cuenta" className={`px-3 py-2 text-sm font-semibold transition ${textoSuave}`}>
                Ingresar
              </Link>
              <Link
                href="/cuenta?modo=registro"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-sm font-bold transition"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        <button
          className={`md:hidden p-2 rounded-xl ${textoSuave}`}
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
        >
          {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuAbierto && (
        <div className="md:hidden border-t border-slate-200 bg-white text-slate-800 px-4 py-3 space-y-1 text-sm font-semibold">
          <Link href="/#habitaciones" onClick={() => setMenuAbierto(false)} className="block py-2">Habitaciones</Link>
          <Link href="/#servicios" onClick={() => setMenuAbierto(false)} className="block py-2">Servicios</Link>
          <Link href="/#contacto" onClick={() => setMenuAbierto(false)} className="block py-2">Contacto</Link>
          {cliente ? (
            <>
              <Link href="/cuenta/reservas" onClick={() => setMenuAbierto(false)} className="block py-2 text-amber-700">Mis reservas</Link>
              <button onClick={salir} className="block py-2 text-rose-600">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/cuenta" onClick={() => setMenuAbierto(false)} className="block py-2">Ingresar</Link>
              <Link href="/cuenta?modo=registro" onClick={() => setMenuAbierto(false)} className="block py-2 text-amber-700">Crear cuenta</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
