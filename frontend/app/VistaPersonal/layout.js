'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BellRing,
  BedDouble,
  CalendarCheck2,
  ExternalLink,
  Hotel,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { ToastProvider, useToast } from '../components/Toast';
import { AuthAPI } from '../../lib/auth';

export default function PersonalLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/VistaPersonal/login';

  if (isLoginPage) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <PersonalLayoutContent pathname={pathname}>
        {children}
      </PersonalLayoutContent>
    </ToastProvider>
  );
}

function PersonalLayoutContent({ children, pathname }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const activeUser = AuthAPI.getUsuarioActual();
    if (!activeUser) {
      router.replace('/VistaPersonal/login');
    } else {
      setUsuario(activeUser);
      setCheckingAuth(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    AuthAPI.logout();
    router.replace('/VistaPersonal/login');
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-amber-500 text-slate-950 rounded-2xl animate-pulse">
            <Hotel className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Verificando sesión del personal...</p>
        </div>
      </div>
    );
  }

  // Filtrar navegación según rol si es personal de limpieza
  const isLimpieza = usuario?.rol === 'LIMPIEZA';

  const allNavItems = [
    {
      href: '/VistaPersonal',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
      roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'GERENTE']
    },
    {
      href: '/VistaPersonal/recepcion',
      label: 'Recepción & Check-In',
      icon: BellRing,
      roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'GERENTE']
    },
    {
      href: '/VistaPersonal/habitaciones',
      label: 'Rack de Habitaciones',
      icon: BedDouble,
      roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'LIMPIEZA', 'GERENTE']
    },
    {
      href: '/VistaPersonal/reservaciones',
      label: 'Reservaciones',
      icon: CalendarCheck2,
      roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'GERENTE']
    }
  ];

  const navItems = allNavItems.filter(item => 
    !usuario?.rol || item.roles.includes(usuario.rol)
  );

  const getInitials = (name) => {
    if (!name) return 'HP';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleIcon = (rol) => {
    switch (rol) {
      case 'ADMINISTRADOR':
      case 'GERENTE':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'LIMPIEZA':
        return <Sparkles className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <KeyRound className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950 font-bold">
            <Hotel className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight text-white">Hotel Princes Ica</h2>
            <span className="text-[10px] text-amber-400 font-medium">Panel de Control</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
        />
      )}

      {/* Barra Lateral (Sidebar) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header del Hotel */}
          <div className="p-3 mb-6 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 shadow-md">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                HOTEL PRINCES
              </h2>
              <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider block">
                Ica & Huacachina
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex flex-col space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
              Módulos Disponibles
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-slate-950" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar & Perfil de Usuario Autenticado */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          {/* Link a la Web Pública */}
          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between border border-slate-800 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" /> Ver Web Huéspedes
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">Público</span>
          </Link>

          {/* Tarjeta de Usuario Activo */}
          {usuario && (
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {getInitials(usuario.nombreCompleto || usuario.username)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">
                    {usuario.nombreCompleto || usuario.username}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 truncate">
                    {getRoleIcon(usuario.rol)}
                    <span>{usuario.rol} • {usuario.turno || 'General'}</span>
                  </div>
                </div>
              </div>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="w-full py-1.5 px-2 bg-slate-900 hover:bg-rose-950/40 hover:border-rose-800 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}