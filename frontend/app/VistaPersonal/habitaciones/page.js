'use client';
import { useState } from 'react';
import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function HabitacionesPage() {
  const [habitaciones] = useState([
    { numero: '102', tipo: 'Matrimonial', precio: 'S/ 180.00', estado: 'Ocupada' },
    { numero: '204', tipo: 'Doble', precio: 'S/ 240.00', estado: 'Disponible' },
    { numero: '308', tipo: 'Simple', precio: 'S/ 120.00', estado: 'En Limpieza' },
  ]);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos los estados');

  const habitacionesFiltradas = habitaciones.filter(h => {
    const coincideTexto = h.numero.toLowerCase().includes(busqueda.toLowerCase()) || 
                          h.tipo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos los estados' || h.estado.toLowerCase() === filtroEstado.toLowerCase();
    return coincideTexto && coincideEstado;
  });

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-700">
      <Sidebar activo="habitaciones" />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header 
          titulo="Control de Habitaciones" 
          subtitulo="Estado general y disponibilidad de la infraestructura hotelera" 
        />

        <div className="p-8 space-y-6 w-full">
          
          {/* 4 Tarjetas de Métricas Arriba */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Disponibles</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">12</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Ocupadas</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">16</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">En Limpieza</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">2</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Mantenimiento</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">0</p>
            </div>
          </div>

          {/* tabla de Habitaciones con Filtros */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            <div className="py-5 px-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-sm font-bold text-slate-800">Listado de Habitaciones</h3>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select 
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-600 bg-white focus:outline-none"
                >
                  <option>Todos los estados</option>
                  <option>Disponible</option>
                  <option>Ocupada</option>
                  <option>En Limpieza</option>
                </select>

                <input 
                  type="text" 
                  placeholder="Buscar habitación..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-600 w-full sm:w-64 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-6 font-semibold">NÚMERO</th>
                    <th className="py-4 px-6 font-semibold">TIPO</th>
                    <th className="py-4 px-6 font-semibold">PRECIO / NOCHE</th>
                    <th className="py-4 px-6 font-semibold">ESTADO ACTUAL</th>
                    {/* Se añadió pr-8 para separar la cabecera de ACCIONES del borde */}
                    <th className="py-4 pl-6 pr-8 font-semibold text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {habitacionesFiltradas.length > 0 ? (
                    habitacionesFiltradas.map((hab, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-bold text-slate-800">{hab.numero}</td>
                        <td className="py-4 px-6">{hab.tipo}</td>
                        <td className="py-4 px-6 font-medium">{hab.precio}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full font-medium text-[10px] inline-block ${
                            hab.estado === 'Disponible' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            hab.estado === 'Ocupada' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {hab.estado}
                          </span>
                        </td>
                        {/* Se añadió pr-8 para separar los botones del borde derecho */}
                        <td className="py-4 pl-6 pr-8 text-right">
                          <button className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400">
                        No se encontraron habitaciones
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}