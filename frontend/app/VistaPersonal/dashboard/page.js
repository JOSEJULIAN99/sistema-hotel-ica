'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function DashboardPage() {
const router = useRouter();

  const reservasRecientes = [
    { codigo: 'RES-101', huesped: 'Carlos Mendoza', habitacion: '102', entrada: '15/09/2025', estado: 'Confirmada' },
    { codigo: 'RES-102', huesped: 'María López', habitacion: '204', entrada: '16/09/2025', estado: 'Confirmada' },
    { codigo: 'RES-103', huesped: 'Juan Pérez', habitacion: '308', entrada: '16/09/2025', estado: 'Pendiente' },
  ];

  const proximosCheckIn = [
    { huesped: 'Juan Pérez', hab: 'Hab. 204 • Matrimonial', hora: '12:30' },
    { huesped: 'Ana García', hab: 'Hab. 308 • Doble', hora: '15:00' },
    { huesped: 'Luis Torres', hab: 'Hab. 102 • Matrimonial', hora: '16:00' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header reutilizado */}
      <Header 
                titulo="Dashboard" 
                subtitulo="Resumen general del hotel" />
      
       

        <div className="p-10 space-y-6">
          
          {/* Fila de 6 Tarjetas de Métricas */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <p className="text-[11px] text-gray-500 font-medium">Reservas del día</p>
              <h3 className="text-2xl font-bold text-slate-800">8</h3>
              <p className="text-[10px] text-emerald-600 font-medium">↑ 2 desde ayer</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <p className="text-[11px] text-gray-500 font-medium">Habitaciones disponibles</p>
              <h3 className="text-2xl font-bold text-slate-800">12</h3>
              <p className="text-[10px] text-gray-400">de 30 en total</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <p className="text-[11px] text-gray-500 font-medium">Habitaciones ocupadas</p>
              <h3 className="text-2xl font-bold text-slate-800">16</h3>
              <p className="text-[10px] text-gray-400">de 30 en total</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <p className="text-[11px] text-gray-500 font-medium">En limpieza</p>
              <h3 className="text-2xl font-bold text-slate-800">2</h3>
              <p className="text-[10px] text-gray-400">habitaciones</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <p className="text-[11px] text-gray-500 font-medium">En mantenimiento</p>
              <h3 className="text-2xl font-bold text-slate-800">0</h3>
              <p className="text-[10px] text-gray-400">habitaciones</p>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-blue-500 shadow-sm space-y-1 bg-gradient-to-br from-white to-blue-50/30">
              <p className="text-[11px] text-blue-600 font-semibold">Ingresos del día</p>
              <h3 className="text-lg font-bold text-slate-900">S/ 2.450,00</h3>
              <p className="text-[10px] text-emerald-600 font-medium">↑ 12% frente a ayer</p>
            </div>
          </div>

          {/* seccion de ultimas reservas y check in*/}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Últimas reservas */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Últimas reservas</h3>
                <Link 
                  href="/VistaPersonal/reservas"
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Ver todas →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
                      <th className="p-3 font-semibold">Código</th>
                      <th className="p-3 font-semibold">Huésped</th>
                      <th className="p-3 font-semibold">Habitación</th>
                      <th className="p-3 font-semibold">Entrada</th>
                      <th className="p-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-slate-700">
                    {reservasRecientes.map((res, index) => (
                      <tr key={index} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-blue-600">{res.codigo}</td>
                        <td className="p-3 font-medium text-slate-800">{res.huesped}</td>
                        <td className="p-3">{res.habitacion}</td>
                        <td className="p-3">{res.entrada}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full font-medium text-[10px] ${
                            res.estado === 'Confirmada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {res.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Próximos check-in */}
            <div className="col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Próximos check-in</h3>
                <button 
                  onClick={() => router.push('/VistaPersonal/recepcion')}
                  className="text-xs font-semibold text-blue-600 cursor-pointer hover:underline"
                >
                  Ver todos →
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {proximosCheckIn.map((item, index) => (
                  <div key={index} className="p-4 flex justify-between items-center hover:bg-gray-50/50">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.huesped}</p>
                      <p className="text-[11px] text-gray-500">{item.hab}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {item.hora}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}