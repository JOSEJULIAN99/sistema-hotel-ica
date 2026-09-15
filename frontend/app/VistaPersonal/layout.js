'use client';

import Link from 'next/link';

export default function PersonalLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* 1. Barra lateral */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-lg">
        <div>
          <div className="mb-8 p-2 text-center border-b border-slate-700">
            <h2 className="text-xl font-bold text-blue-400">🏨 Hotel Princes</h2>
            <span className="text-xs text-gray-400">Panel del Personal</span>
          </div>

          {/* Menú de navegación a las subrutas del módulo */}
          <nav className="flex flex-col space-y-2">
            <Link 
              href="/VistaPersonal" 
              className="p-3 rounded-lg hover:bg-slate-800 transition text-sm font-medium flex items-center gap-2"
            >
              📊 <span>Dashboard Principal</span>
            </Link>

            <Link 
              href="/VistaPersonal/recepcion" 
              className="p-3 rounded-lg hover:bg-slate-800 transition text-sm font-medium flex items-center gap-2"
            >
              🛎️ <span>Recepción / Check-in</span>
            </Link>

            <Link 
              href="/VistaPersonal/habitaciones" 
              className="p-3 rounded-lg hover:bg-slate-800 transition text-sm font-medium flex items-center gap-2"
            >
              🛏️ <span>Habitaciones</span>
            </Link>

            <Link 
              href="/VistaPersonal/limpieza" 
              className="p-3 rounded-lg hover:bg-slate-800 transition text-sm font-medium flex items-center gap-2"
            >
              🧹 <span>Limpieza y Servicio</span>
            </Link>
          </nav>
        </div>

        <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm font-semibold text-gray-200">Pablo Luna</p>
          <p className="text-xs text-blue-400">Recepcionista - Turno Tarde</p>
        </div>
      </aside>

      {/* 2. Area del contenido, donde se renderiza el page.js */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}