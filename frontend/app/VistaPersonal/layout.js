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
  Sparkles,
  Package,
  CreditCard,
  FileText,
  Bot,
  Settings,
  TrendingUp,
  Wrench,
  Activity
} from 'lucide-react';

import { ToastProvider } from '../components/Toast';
import CampanaAvisos from '../components/CampanaAvisos';
import { AuthAPI } from '../../lib/auth';

// Rutas del panel y roles que pueden abrirlas (además de ocultarlas en el menú).
// El backend vuelve a validar cada petición; esto evita pantallas vacías por URL directa.
const ACCESO_POR_RUTA = [
  { prefijo: '/VistaPersonal/recepcion', roles: ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'GERENTE'] },
  { prefijo: '/VistaPersonal/reservaciones', roles: ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'GERENTE'] },
  { prefijo: '/VistaPersonal/huespedes', roles: ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'GERENTE'] },
  { prefijo: '/VistaPersonal/almacen', roles: ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'GERENTE'] },
  { prefijo: '/VistaPersonal/transacciones', roles: ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'GERENTE'] },
  { prefijo: '/VistaPersonal/reportes', roles: ['ADMINISTRADOR', 'ADMIN', 'GERENTE'] },
  { prefijo: '/VistaPersonal/Limpieza', roles: ['ADMINISTRADOR', 'ADMIN', 'LIMPIEZA', 'GERENTE'] },
  { prefijo: '/VistaPersonal/configuracion', roles: ['ADMINISTRADOR', 'ADMIN'] },
  { prefijo: '/VistaPersonal/tarifas', roles: ['ADMINISTRADOR', 'ADMIN', 'GERENTE'] },
  { prefijo: '/VistaPersonal/monitoreo', roles: ['ADMINISTRADOR', 'ADMIN', 'GERENTE'] }
];

function rutaPermitida(pathname, rol) {
  if (pathname === '/VistaPersonal' || pathname === '/VistaPersonal/') {
    return rol !== 'LIMPIEZA';
  }
  const regla = ACCESO_POR_RUTA.find(r => pathname.startsWith(r.prefijo));
  return !regla || regla.roles.includes(rol);
}

export default function PersonalLayout({ children }) {
  const pathname = usePathname();

  const isLoginPage =
    pathname === '/VistaPersonal/login';

  if (isLoginPage) {
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <PersonalLayoutContent pathname={pathname}>
        {children}
      </PersonalLayoutContent>
    </ToastProvider>
  );
}

function PersonalLayoutContent({
  children,
  pathname
}) {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [usuario, setUsuario] = useState(null);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  // ============================================================
  // VERIFICAR SESIÓN
  // ============================================================

  useEffect(() => {
    const activeUser =
      AuthAPI.getUsuarioActual();

    if (!activeUser) {
      router.replace(
        '/VistaPersonal/login'
      );
    } else if (!rutaPermitida(pathname, String(activeUser.rol || '').toUpperCase())) {
      // Rol sin acceso a esta pantalla: enviarlo a su vista principal
      router.replace(
        String(activeUser.rol || '').toUpperCase() === 'LIMPIEZA'
          ? '/VistaPersonal/Limpieza'
          : '/VistaPersonal'
      );
    } else {
      setUsuario(activeUser);
      setCheckingAuth(false);
    }
  }, [pathname, router]);

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================

  const handleLogout = () => {
    AuthAPI.logout();

    router.replace(
      '/VistaPersonal/login'
    );
  };

  // ============================================================
  // PANTALLA DE VERIFICACIÓN
  // ============================================================

  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans">

        <div className="text-center space-y-3">

          <div className="inline-flex p-3 bg-amber-500 text-slate-950 rounded-2xl animate-pulse">
            <Hotel className="w-8 h-8" />
          </div>

          <p className="text-sm font-semibold text-slate-300">
            Verificando sesión del personal...
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // ROL ACTUAL
  // ============================================================

  const rolActual = String(
    usuario?.rol || ''
  ).toUpperCase();

  const esAdmin =
    rolActual === 'ADMINISTRADOR' ||
    rolActual === 'ADMIN';

  const esRecepcionista =
    rolActual === 'RECEPCIONISTA';

  const esLimpieza =
    rolActual === 'LIMPIEZA';

  const esGerente =
    rolActual === 'GERENTE';

  // ============================================================
  // MENÚ GENERAL
  // ============================================================

  const allNavItems = [

    // ----------------------------------------------------------
    // DASHBOARD
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'RECEPCIONISTA',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // RECEPCIÓN
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/recepcion',
      label: 'Recepción & Check-In',
      icon: BellRing,
      roles: [
        'RECEPCIONISTA',
        'ADMINISTRADOR',
        'ADMIN',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // HABITACIONES
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/habitaciones',
      label: 'Rack de Habitaciones',
      icon: BedDouble,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'RECEPCIONISTA',
        'LIMPIEZA',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // RESERVACIONES
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/reservaciones',
      label: 'Reservaciones',
      icon: CalendarCheck2,
      roles: [
        'RECEPCIONISTA',
        'ADMINISTRADOR',
        'ADMIN',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // LIMPIEZA
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/Limpieza',
      label: 'Aseo y Limpieza',
      icon: Sparkles,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'LIMPIEZA',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // INCIDENCIAS DE MANTENIMIENTO
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/incidencias',
      label: 'Incidencias',
      icon: Wrench,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'RECEPCIONISTA',
        'LIMPIEZA',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // ALMACÉN
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/almacen',
      label: 'Almacén',
      icon: Package,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'RECEPCIONISTA',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // TRANSACCIONES
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/transacciones',
      label: 'Transacciones',
      icon: CreditCard,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'RECEPCIONISTA',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // ASISTENTE IA
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/asistente',
      label: 'Asistente IA',
      icon: Bot,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'RECEPCIONISTA',
        'GERENTE',
        'LIMPIEZA'
      ]
    },

    // ----------------------------------------------------------
    // MONITOREO DEL SISTEMA
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/monitoreo',
      label: 'Monitoreo',
      icon: Activity,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // TARIFAS DINÁMICAS
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/tarifas',
      label: 'Tarifas dinámicas',
      icon: TrendingUp,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'GERENTE'
      ]
    },

    // ----------------------------------------------------------
    // CONFIGURACIÓN DE LA IA (base de conocimiento)
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/configuracion',
      label: 'Configuración IA',
      icon: Settings,
      roles: [
        'ADMINISTRADOR',
        'ADMIN'
      ]
    },

    // ----------------------------------------------------------
    // REPORTES
    // ----------------------------------------------------------

    {
      href: '/VistaPersonal/reportes',
      label: 'Reportes',
      icon: FileText,
      roles: [
        'ADMINISTRADOR',
        'ADMIN',
        'GERENTE'
      ]
    }

  ];

  // ============================================================
  // FILTRAR MENÚ SEGÚN ROL
  // ============================================================

  const navItems =
    allNavItems.filter(item =>
      item.roles.includes(rolActual)
    );

  // ============================================================
  // INICIALES DEL USUARIO
  // ============================================================

  const getInitials = name => {

    if (!name) {
      return 'HP';
    }

    const parts =
      name.trim().split(/\s+/);

    if (parts.length >= 2) {

      return `${parts[0][0]}${parts[1][0]}`
        .toUpperCase();

    }

    return name
      .slice(0, 2)
      .toUpperCase();
  };

  // ============================================================
  // ICONO SEGÚN ROL
  // ============================================================

  const getRoleIcon = rol => {

    switch (String(rol).toUpperCase()) {

      case 'ADMINISTRADOR':
      case 'ADMIN':
      case 'GERENTE':

        return (
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        );

      case 'LIMPIEZA':

        return (
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        );

      default:

        return (
          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
        );
    }
  };

  // ============================================================
  // NOMBRE DEL ROL PARA MOSTRAR
  // ============================================================

  const getRoleLabel = rol => {

    switch (String(rol).toUpperCase()) {

      case 'ADMIN':
        return 'ADMINISTRADOR';

      case 'ADMINISTRADOR':
        return 'ADMINISTRADOR';

      case 'RECEPCIONISTA':
        return 'RECEPCIONISTA';

      case 'LIMPIEZA':
        return 'LIMPIEZA';

      case 'GERENTE':
        return 'GERENTE';

      default:
        return rol || 'PERSONAL';
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">

      {/* ======================================================
          HEADER MÓVIL
      ====================================================== */}

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md">

        <div className="flex items-center gap-2">

          <div className="p-1.5 bg-amber-500 rounded-lg text-slate-950 font-bold">
            <Hotel className="w-5 h-5" />
          </div>

          <div>

            <h2 className="font-bold text-sm tracking-tight text-white">
              Hotel Princes Ica
            </h2>

            <span className="text-[10px] text-amber-400 font-medium">
              Panel de Control
            </span>

          </div>

        </div>

        <button
          onClick={() =>
            setMobileMenuOpen(
              !mobileMenuOpen
            )
          }
          className="p-2 text-slate-300 hover:text-white rounded-lg"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

      </div>

      {/* ======================================================
          BACKDROP MÓVIL
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >

        {/* ==================================================
            PARTE SUPERIOR
        ================================================== */}

        <div>

          {/* ------------------------------------------------
              LOGO HOTEL
          ------------------------------------------------ */}

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

          {/* ------------------------------------------------
              INDICADOR DEL TIPO DE PANEL
          ------------------------------------------------ */}

          <div className="px-3 mb-3">

            <div className="flex items-center gap-2">

              {getRoleIcon(rolActual)}

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {esAdmin
                  ? 'Panel Administrativo'
                  : esRecepcionista
                  ? 'Panel de Recepción'
                  : esLimpieza
                  ? 'Panel de Limpieza'
                  : esGerente
                  ? 'Panel de Gestión'
                  : 'Módulos Disponibles'}
              </span>

            </div>

          </div>

          {/* ------------------------------------------------
              MENÚ
          ------------------------------------------------ */}

          <nav className="flex flex-col space-y-1.5">

            {navItems.map(item => {

              const Icon = item.icon;

              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(
                    item.href
                  );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-slate-950'
                          : 'text-slate-400'
                      }`}
                    />

                    <span>
                      {item.label}
                    </span>

                  </div>

                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-slate-950" />
                  )}

                </Link>
              );

            })}

          </nav>

        </div>

        {/* ==================================================
            FOOTER SIDEBAR
        ================================================== */}

        <div className="space-y-3 pt-4 border-t border-slate-800">

          {/* ------------------------------------------------
              WEB PÚBLICA
          ------------------------------------------------ */}

          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between border border-slate-800 transition"
          >

            <span className="flex items-center gap-2">

              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />

              Ver Web Huéspedes

            </span>

            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
              Público
            </span>

          </Link>

          {/* ------------------------------------------------
              USUARIO
          ------------------------------------------------ */}

          {usuario && (

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">

                  {getInitials(
                    usuario.nombreCompleto ||
                    usuario.username
                  )}

                </div>

                <div className="flex-1 overflow-hidden">

                  <p className="text-xs font-bold text-white truncate">

                    {usuario.nombreCompleto ||
                      usuario.username}

                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 truncate">

                    {getRoleIcon(
                      usuario.rol
                    )}

                    <span>
                      {getRoleLabel(
                        usuario.rol
                      )}{' '}
                      •{' '}
                      {usuario.turno ||
                        'General'}
                    </span>

                  </div>

                </div>

              </div>

              {/* ------------------------------------------------
                  CERRAR SESIÓN
              ------------------------------------------------ */}

              <button
                onClick={handleLogout}
                className="w-full py-1.5 px-2 bg-slate-900 hover:bg-rose-950/40 hover:border-rose-800 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-2"
              >

                <LogOut className="w-3.5 h-3.5" />

                <span>
                  Cerrar Sesión
                </span>

              </button>

            </div>

          )}

        </div>

      </aside>

      {/* ======================================================
          CONTENIDO PRINCIPAL
      ====================================================== */}

      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">

        {children}

      </main>

      {/* Avisos instantáneos en tiempo real */}
      <CampanaAvisos rol={rolActual} />

    </div>
  );
}