'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Hotel,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { AuthAPI } from '../../../lib/auth';
import { useToast } from '../../components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir al panel
    if (AuthAPI.isAuthenticated()) {
      router.push('/VistaPersonal');
    }
  }, [router]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast('Por favor ingresa usuario y contraseña', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthAPI.login(username.trim(), password.trim());
      addToast(`¡Bienvenido/a, ${user.nombreCompleto || user.username}!`, 'success');
      router.push('/VistaPersonal');
    } catch (err) {
      addToast(err.message || 'Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userAcc, passAcc) => {
    setUsername(userAcc);
    setPassword(passAcc);
    setLoading(true);
    try {
      const user = await AuthAPI.login(userAcc, passAcc);
      addToast(`Sesión iniciada como ${user.nombreCompleto} (${user.rol})`, 'success');
      router.push('/VistaPersonal');
    } catch (err) {
      addToast(err.message || 'Error en acceso rápido', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-white font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Botón Volver a la Web Principal */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Sitio Web
        </Link>
        <span className="text-[11px] font-mono text-slate-500">v2.0 • PostgreSQL</span>
      </div>

      {/* Tarjeta de Login */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
        {/* Glow Decorativo */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20 mb-3">
            <Hotel className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            HOTEL PRINCES ICA
          </h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase mt-0.5">
            Acceso al Sistema del Personal
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Inicia sesión con tu cuenta asignada según tu turno y rol.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Usuario del Sistema
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: pluna, admin, rflores"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full pl-10 pr-11 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Ingresar al Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separador de Cuentas Rápidas para Demo */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3 text-center">
            Seleccionar Rol para Acceso Directo:
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-2.5 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-amber-400">Admin General</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">admin • Todos los módulos</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('pluna', 'hotel123')}
              className="p-2.5 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-amber-400">Recepcionista</span>
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">pluna • Turno Tarde</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('mgomez', 'hotel123')}
              className="p-2.5 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-amber-400">Recepcionista</span>
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">mgomez • Turno Mañana</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('rflores', 'hotel123')}
              className="p-2.5 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-amber-400">Limpieza</span>
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">rflores • Mucama</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
