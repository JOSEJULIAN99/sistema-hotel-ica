import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-800">
      
      {/* 1. Sidebar- menu lateral*/}
      <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo del Hotel */}
          <div className="p-6 border-b border-slate-700">
            <Image  src="/hotel2.png"  alt="Logo Princes" width={130} height={40} className="object-contain"  />
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold pl-1">
              Sistema de Gestión
             </p>
          </div>

          {/* Navbar */}
          <nav className="p-4 space-y-1 text-xs font-medium">
            <a href="/app/VistaPeronsal/dashboard" className="flex items-center gap-3 px-4 py-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg font-medium">
              📊 Dashboard
            </a>
            <a href="/app/VistaPeronsal/reservas" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              📅 Reservas
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🔑 Check-in / Check-out
            </a>
            <a href="/app/VistaPeronsal/habitaciones" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🛏️ Habitaciones
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🧹 Limpieza
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🔧 Mantenimiento
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              💳 Consumos
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              📄 Pagos y facturación
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              👥 Usuarios y roles
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700/60">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-medium w-full">
               <span>❌​</span>
               <span>Cerrar sesión</span>
        </Link>
        </div>
      </aside>

      {/* 2. Area Principal */}
      <main className="flex-1 flex flex-col">
        
        {/* Header*/}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
            <p className="text-xs text-gray-500">Resumen general del hotel</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
              📅 Hoy, 16 de septiembre de 2025
            </span>
            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
              <div className="bg-blue-600 text-white font-bold w-9 h-9 rounded-full flex items-center justify-center">
                AT
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800 leading-tight">Ana Torres</p>
                <p className="text-xs text-gray-500">Recepción</p>
              </div>
            </div>
          </div>
        </header>

        {/* Cuerpo del Dashboard (Tarjetas de Métricas) */}
        <div className="p-8 space-y-6 overflow-y-auto">
          
          {/* Fila de Tarjetas Superiores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Reservas del día</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">8</h3>
              <p className="text-xs text-green-600 font-medium mt-1">↑ 2 desde ayer</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Habitaciones disponibles</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">12</h3>
              <p className="text-xs text-gray-400 mt-1">de 30 total</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Habitaciones ocupadas</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">16</h3>
              <p className="text-xs text-gray-400 mt-1">de 30 total</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">En limpieza</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">2</h3>
              <p className="text-xs text-gray-400 mt-1">habitaciones</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">En mantenimiento</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">0</h3>
              <p className="text-xs text-gray-400 mt-1">habitaciones</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-600">
              <p className="text-xs text-gray-500 font-medium">Ingresos del día</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">S/ 2,450.00</h3>
              <p className="text-xs text-green-600 font-medium mt-1">↑ 12% vs. ayer</p>
            </div>

          </div>

          {/*  Tablas y Accesos Rápidos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tabla de Últimas Reservas (Ocupa 2 columnas) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Últimas reservas</h3>
                <a href="#" className="text-xs text-blue-600 font-medium hover:underline">Ver todas →</a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Huésped</th>
                      <th className="p-3">Habitación</th>
                      <th className="p-3">Entrada</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-3 font-medium text-blue-600">RES-101</td>
                      <td className="p-3">Carlos Mendoza</td>
                      <td className="p-3">102</td>
                      <td className="p-3">15/09/2025</td>
                      <td className="p-3"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">Confirmada</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-blue-600">RES-102</td>
                      <td className="p-3">María López</td>
                      <td className="p-3">204</td>
                      <td className="p-3">16/09/2025</td>
                      <td className="p-3"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">Confirmada</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-blue-600">RES-103</td>
                      <td className="p-3">Juan Pérez</td>
                      <td className="p-3">308</td>
                      <td className="p-3">16/09/2025</td>
                      <td className="p-3"><span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold">Pendiente</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Panel de Próximos Check-ins (Ocupa 1 columna) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Próximos check-in</h3>
                <a href="#" className="text-xs text-blue-600 font-medium hover:underline">Ver todos →</a>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Juan Pérez</p>
                    <p className="text-xs text-gray-500">Hab. 204 • Matrimonial</p>
                  </div>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">12:30</span>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Ana García</p>
                    <p className="text-xs text-gray-500">Hab. 308 • Doble</p>
                  </div>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">15:00</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Luis Torres</p>
                    <p className="text-xs text-gray-500">Hab. 102 • Matrimonial</p>
                  </div>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">16:00</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}