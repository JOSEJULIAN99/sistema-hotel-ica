'use client';
import { useState } from 'react';
import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function LimpiezaPage() {
 const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  
  const [habitacionesLimpieza, setHabitacionesLimpieza] = useState([
    { numero: '102', tipo: 'Matrimonial', piso: '1', estado: 'Pendiente', personal: 'Sin asignar' },
    { numero: '204', tipo: 'Doble', piso: '2', estado: 'En proceso', personal: 'Ana Torres' },
    { numero: '308', tipo: 'Simple', piso: '3', estado: 'Completado', personal: 'Carlos Ruiz' },
  ]);

  // Estados para el modal de actualizar estado
  const [modalAbierto, setModalAbierto] = useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);

  // Abrir modal de actualización
  const abrirModalActualizar = (hab) => {
    setHabitacionSeleccionada({ ...hab });
    setModalAbierto(true);
  };

  // Guardar cambios de estado
  const guardarCambios = (e) => {
    e.preventDefault();
    setHabitacionesLimpieza(habitacionesLimpieza.map(h => 
      h.numero === habitacionSeleccionada.numero ? habitacionSeleccionada : h
    ));
    setModalAbierto(false);
  };

  // Filtrado por buscador y estado
  const habitacionesFiltradas = habitacionesLimpieza.filter(hab => {
    const coincideTexto = 
      hab.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      hab.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      hab.personal.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstado = filtroEstado === 'Todos' || hab.estado === filtroEstado;

    return coincideTexto && coincideEstado;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* Sidebar */}
      <Sidebar activo="limpieza" />

      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header */}
        <Header 
          titulo="Control de Limpieza" 
          subtitulo="Monitoreo y asignación de limpieza de habitaciones" 
        />

        <div className="p-10 space-y-6">
          
          {/* Tarjetas de Resumen Rápido */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Pendientes</p>
              <h3 className="text-2xl font-bold text-amber-600">
                {habitacionesLimpieza.filter(h => h.estado === 'Pendiente').length}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">En Proceso</p>
              <h3 className="text-2xl font-bold text-blue-600">
                {habitacionesLimpieza.filter(h => h.estado === 'En proceso').length}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Completados</p>
              <h3 className="text-2xl font-bold text-emerald-600">
                {habitacionesLimpieza.filter(h => h.estado === 'Completado').length}
              </h3>
            </div>
          </div>

          {/* Tabla con Buscador y Filtros */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center gap-4 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800">Estado de Limpieza por Habitación</h3>
              
              <div className="flex items-center gap-3">
                {/* filtro por estado */}
                <select 
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Completado">Completado</option>
                </select>

                {/* Input de Buscador */}
                <input 
                  type="text" 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por habitación, tipo o personal..." 
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs w-72 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
                  <th className="p-4 font-semibold">Habitación</th>
                  <th className="p-4 font-semibold">Tipo</th>
                  <th className="p-4 font-semibold">Piso</th>
                  <th className="p-4 font-semibold">Estado de Limpieza</th>
                  <th className="p-4 font-semibold">Personal Asignado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {habitacionesFiltradas.length > 0 ? (
                  habitacionesFiltradas.map((hab, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold text-slate-800">{hab.numero}</td>
                      <td className="p-4 font-medium">{hab.tipo}</td>
                      <td className="p-4">{hab.piso}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-medium text-[10px] ${
                          hab.estado === 'Completado' ? 'bg-emerald-100 text-emerald-700' :
                          hab.estado === 'En proceso' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {hab.estado}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{hab.personal}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => abrirModalActualizar(hab)}
                          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          Actualizar estado
                        </button>
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

      {/* Modal para actualizar el estado de la limpieza*/}
      {modalAbierto && habitacionSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-slate-800">Actualizar Limpieza - Habitación {habitacionSeleccionada.numero}</h3>
              <button 
                onClick={() => setModalAbierto(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardarCambios} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Estado de Limpieza</label>
                <select 
                  value={habitacionSeleccionada.estado}
                  onChange={(e) => setHabitacionSeleccionada({...habitacionSeleccionada, estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Personal Asignado</label>
                <input 
                  type="text" 
                  value={habitacionSeleccionada.personal}
                  onChange={(e) => setHabitacionSeleccionada({...habitacionSeleccionada, personal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}