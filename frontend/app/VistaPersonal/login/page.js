'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Hotel, KeyRound, Lock, User, ShieldCheck, ArrowLeft } from 'lucide-react';
import { AuthAPI } from '../../../lib/auth';
import { useToast } from '../../components/Toast';

// Ingreso exclusivo del personal del hotel. Las cuentas las crea el administrador en "Usuarios";
// los clientes ingresan desde la web pública (/cuenta).
function rutaInicial(rol) {
  const r = String(rol || '').toUpperCase();
  if (r === 'LIMPIEZA') return '/VistaPersonal/Limpieza';
  return '/VistaPersonal';
}

export default function LoginPersonalPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const actual = AuthAPI.getUsuarioActual();
    if (actual) router.replace(rutaInicial(actual.rol));
  }, [router]);

  const ingresar = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      addToast('Ingresa usuario y contraseña', 'error');
      return;
    }
    setCargando(true);
    try {
      const user = await AuthAPI.login(username.trim(), password);
      try {
        localStorage.setItem('userRole', user.rol || '');
        localStorage.setItem('userName', user.nombreCompleto || user.username || '');
      } catch (err) {
        // sin almacenamiento: la sesión principal ya quedó guardada
      }
      addToast(`Bienvenido/a ${user.nombreCompleto || user.username}`, 'success');
      router.push(rutaInicial(user.rol));
    } catch (err) {
      addToast(err.message || 'Credenciales incorrectas', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950 font-sans">
      <section className="hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=70')" }}
        />
        <div className="relative flex items-center gap-3">
          <span className="p-2.5 bg-amber-400 rounded-xl text-slate-900"><Hotel className="w-6 h-6" /></span>
          <div>
            <p className="font-bold text-lg leading-tight">Hotel Princes Ica</p>
            <p className="text-xs text-amber-300 uppercase tracking-[0.2em]">Panel del personal</p>
          </div>
        </div>
        <div className="relative space-y-3 max-w-md">
          <h1 className="text-4xl font-black leading-tight">Recepción, limpieza y gestión en un solo lugar</h1>
          <p className="text-slate-300 text-sm">Cada rol ve solo los módulos que le corresponden. Si aún no tienes usuario, pídeselo al administrador del hotel.</p>
        </div>
        <p className="relative text-xs text-slate-500">Acceso restringido al personal autorizado.</p>
      </section>

      <section className="flex items-center justify-center p-6 bg-slate-100 lg:rounded-l-[2rem]">
        <form onSubmit={ingresar} className="w-full max-w-sm space-y-5">
          <div className="lg:hidden flex items-center gap-2 text-slate-900">
            <span className="p-2 bg-amber-400 rounded-xl"><Hotel className="w-5 h-5" /></span>
            <span className="font-bold">Hotel Princes Ica</span>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Personal del hotel
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Iniciar sesión</h2>
            <p className="text-sm text-slate-500 mt-1">Usa el usuario que te entregó el administrador.</p>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Usuario</span>
            <div className="mt-1 relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Ej: pluna"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Contraseña</span>
            <div className="mt-1 relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="••••••••"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4 text-amber-400" /> {cargando ? 'Verificando…' : 'Ingresar al panel'}
          </button>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
            <p>¿Olvidaste tu contraseña? El administrador puede restablecerla desde el módulo Usuarios.</p>
            <p>
              ¿Eres huésped?{' '}
              <Link href="/cuenta" className="font-semibold text-amber-700 hover:underline">Ingresa a tu cuenta de cliente</Link>
            </p>
            <Link href="/" className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a la web del hotel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
