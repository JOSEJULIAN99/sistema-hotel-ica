'use client';
import { useState } from 'react';
import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function RecepcionPage() {
  const [busqueda, setBusqueda] = useState('');

  // Estado inicial con los movimientos para poder modificarlos interactivamente
  const [movimientos, setMovimientos] = useState([
    {
      id: 1,
      huesped: 'Juan Pérez',
      habitacion: '204 (Doble)',
      tipo: 'Check-in',
      hora: '12:30 PM',
      estadoTexto: 'Pendiente de llegada',
      estadoClase: 'bg-blue-100 text-blue-700',
      accionTipo: 'check-in'
    },
    {
      id: 2,
      huesped: 'Carlos Mendoza',
      habitacion: '102 (Matrimonial)',
      tipo: 'Check-out',
      hora: '11:00 AM',
      estadoTexto: 'En estancia',
      estadoClase: 'bg-emerald-100 text-emerald-700',
      accionTipo: 'check-out'
    },
    {
      id: 3,
      huesped: 'María López',
      habitacion: '308 (Simple)',
      tipo: 'Check-in',
      hora: '02:00 PM',
      estadoTexto: 'Pendiente de llegada',
      estadoClase: 'bg-blue-100 text-blue-700',
      accionTipo: 'check-in'
    }
  ]);

  // Función para manejar las acciones de Check-in y Check-out
  const manejarAccion = (id, tipoAccion) => {
    setMovimientos(movimientos.map(item => {
      if (item.id === id) {
        if (tipoAccion === 'check-in') {
          return {
            ...item,
            estadoTexto: 'Hospedado (Check-in realizado)',
            estadoClase: 'bg-emerald-100 text-emerald-700',
            accionTipo: null // Oculta o deshabilita el botón tras completarse
          };
        } else {
          return {
            ...item,
            estadoTexto: 'Finalizado (Check-out realizado)',
            estadoClase: 'bg-gray-200 text-gray-700',
            accionTipo: null
          };
        }
      }
      return item;
    }));
  };

  // Filtrar segun lo que se escriba en el input
  const movimientosFiltrados = movimientos.filter(item => 
    item.huesped.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.habitacion.toLowerCase().includes(busqueda.toLowerCase())
  );
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/*  Sidebar Reutilizable */}
      <Sidebar activo="recepcion" />

    
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Reutilizable */}
        <Header 
          titulo="Control de Check-in y Check-out" 
          subtitulo="Gestión de ingresos y salidas de huéspedes en tiempo real"   />

        <div className="p-10 space-y-6">
          
          {/*Métricas Operativas */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Llegadas Previstas (Hoy)</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">5</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Huéspedes Hospedados</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">16</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Salidas Previstas (Hoy)</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">3</p>
            </div>
          </div>
          {/* Tabla */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Huéspedes en Curso y Próximos Movimientos</h3>
              <input 
                type="text" 
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por huésped o habitación..." 
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs w-64 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Huésped</th>
                  <th className="p-4 font-semibold">Habitación</th>
                  <th className="p-4 font-semibold">Tipo de Movimiento</th>
                  <th className="p-4 font-semibold">Hora Estimada</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {movimientosFiltrados.length > 0 ? (
                  movimientosFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold text-slate-800">{item.huesped}</td>
                      <td className="p-4">{item.habitacion}</td>
                      <td className={`p-4 font-medium ${item.tipo === 'Check-in' ? 'text-blue-600' : 'text-amber-600'}`}>
                        {item.tipo}
                      </td>
                      <td className="p-4">{item.hora}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-medium text-[11px] ${item.estadoClase}`}>
                          {item.estadoTexto}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {item.accionTipo === 'check-in' && (
                          <button 
                            onClick={() => manejarAccion(item.id, 'check-in')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer"
                          >
                            Realizar Check-in
                          </button>
                        )}
                        {item.accionTipo === 'check-out' && (
                          <button 
                            onClick={() => manejarAccion(item.id, 'check-out')}
                            className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer"
                          >
                            Realizar Check-out
                          </button>
                        )}
                        {!item.accionTipo && (
                          <span className="text-gray-400 font-medium italic">Completado</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-400">
                      No se encontraron resultados para &quot;{busqueda}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}