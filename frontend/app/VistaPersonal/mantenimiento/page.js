'use client';
import { useState } from 'react';
import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function MantenimientoPage() { 

  const [incidencias, setIncidencias] = useState([
    { codigo: 'INC-001', habitacion: '302', descripcion: 'Fuga de agua en el baño principal', prioridad: 'Alta', estado: 'En Reparación' },
    { codigo: 'INC-002', habitacion: '104', descripcion: 'Falla en el control remoto del aire acondicionado', prioridad: 'Media', estado: 'Pendiente' },
  ]);

  
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [nuevaHabitacion, setNuevaHabitacion] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState('Media');

  // Estados para el modal para las acciones
  const [modalAccionAbierto, setModalAccionAbierto] = useState(false);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);

  // Registrar nueva incidencia
  const registrarIncidencia = (e) => {
    e.preventDefault();
    const codigoGenerado = `INC-00${incidencias.length + 1}`;
    const nueva = {
      codigo: codigoGenerado,
      habitacion: nuevaHabitacion,
      descripcion: nuevaDescripcion,
      prioridad: nuevaPrioridad,
      estado: 'Pendiente'
    };
    setIncidencias([nueva, ...incidencias]);
    setNuevaHabitacion('');
    setNuevaDescripcion('');
    setNuevaPrioridad('Media');
    setModalReporteAbierto(false);
  };

  
  const abrirModalAccion = (inc) => {
    setIncidenciaSeleccionada({ ...inc });
    setModalAccionAbierto(true);
  };

  // Guardar cambios de estado desde el modal de acción
  const guardarAccion = (e) => {
    e.preventDefault();
    setIncidencias(incidencias.map(i => 
      i.codigo ===idenciaSeleccionada.codigo ? incidenciaSeleccionada : i
    ));
    setModalAccionAbierto(false);
  };

  
  const cambiarEstadoRapido = (codigo) => {
    setIncidencias(incidencias.map(i => {
      if (i.codigo === codigo) {
        let siguienteEstado = 'Pendiente';
        if (i.estado === 'Pendiente') siguienteEstado = 'En Reparación';
        else if (i.estado === 'En Reparación') siguienteEstado = 'Resuelto';
        return { ...i, estado: siguienteEstado };
      }
      return i;
    }));
  };

  // Contadores para las tarjetas
  const totalPendientes = incidencias.filter(i => i.estado === 'Pendiente').length;
  const totalEnReparacion = incidencias.filter(i => i.estado === 'En Reparación').length;
  const totalResueltos = incidencias.filter(i => i.estado === 'Resuelto').length + 14; // Base simulada + mes

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* Sidebar */}
      <Sidebar activo="mantenimiento" />

      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header */}
        <Header 
          titulo="Control de Mantenimiento" 
          subtitulo="Registro y seguimiento de incidencias técnicas en la infraestructura" 
        />

        <div className="p-10 space-y-6">
          
          {/* Tarjetas de Resumen */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Reportes Pendientes</p>
              <h3 className="text-2xl font-bold text-red-600">{totalPendientes}</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">En Reparación</p>
              <h3 className="text-2xl font-bold text-amber-600">{totalEnReparacion}</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Resueltos (Este Mes)</p>
              <h3 className="text-2xl font-bold text-emerald-600">{totalResueltos}</h3>
            </div>
          </div>

          {/* Sección de la Tabla */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Incidencias y Reparaciones Activas</h3>
              
              <button 
                onClick={() => setModalReporteAbierto(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer shadow-sm"
              >
                + Reportar Incidencia
              </button>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
                  <th className="p-4 font-semibold">Código</th>
                  <th className="p-4 font-semibold">Habitación</th>
                  <th className="p-4 font-semibold">Descripción del Problema</th>
                  <th className="p-4 font-semibold">Prioridad</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {incidencias.length > 0 ? (
                  incidencias.map((inc, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold text-blue-600">{inc.codigo}</td>
                      <td className="p-4 font-medium text-slate-800">{inc.habitacion}</td>
                      <td className="p-4">{inc.descripcion}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-medium text-[10px] ${
                          inc.prioridad === 'Alta' ? 'bg-red-100 text-red-700' :
                          inc.prioridad === 'Media' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {inc.prioridad}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-medium text-[10px] ${
                          inc.estado === 'Resuelto' ? 'bg-emerald-100 text-emerald-700' :
                          inc.estado === 'En Reparación' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {inc.estado}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        {inc.estado !== 'Resuelto' && (
                          <button 
                            onClick={() => cambiarEstadoRapido(inc.codigo)}
                            className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                          >
                            {inc.estado === 'Pendiente' ? 'Iniciar' : 'Finalizar'}
                          </button>
                        )}
                        <button 
                          onClick={() => abrirModalAccion(inc)}
                          className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-400">
                      No hay incidencias registradas actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>

        </div>
      </main>

      {/* Modal para reportar una incidencia */}
      {modalReporteAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-slate-800">Reportar Nueva Incidencia</h3>
              <button 
                onClick={() => setModalReporteAbierto(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={registrarIncidencia} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Número de Habitación / Área</label>
                <input 
                  type="text" 
                  value={nuevaHabitacion}
                  onChange={(e) => setNuevaHabitacion(e.target.value)}
                  placeholder="Ej. 302 o Lobby"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Descripción del Problema</label>
                <textarea 
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  placeholder="Detalla brevemente la falla..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Prioridad</label>
                <select 
                  value={nuevaPrioridad}
                  onChange={(e) => setNuevaPrioridad(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setModalReporteAbierto(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer shadow-sm"
                >
                  Guardar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar  */}
      {modalAccionAbierto && incidenciaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-slate-800">Gestionar Incidencia: {incidenciaSeleccionada.codigo}</h3>
              <button 
                onClick={() => setModalAccionAbierto(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardarAccion} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Habitación</label>
                <input 
                  type="text" 
                  value={incidenciaSeleccionada.habitacion}
                  onChange={(e) => setIncidenciaSeleccionada({...incidenciaSeleccionada, habitacion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Descripción</label>
                <textarea 
                  value={incidenciaSeleccionada.descripcion}
                  onChange={(e) => setIncidenciaSeleccionada({...incidenciaSeleccionada, descripcion: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Prioridad</label>
                  <select 
                    value={incidenciaSeleccionada.prioridad}
                    onChange={(e) => setIncidenciaSeleccionada({...incidenciaSeleccionada, prioridad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Estado</label>
                  <select 
                    value={incidenciaSeleccionada.estado}
                    onChange={(e) => setIncidenciaSeleccionada({...incidenciaSeleccionada, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Reparación">En Reparación</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setModalAccionAbierto(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer shadow-sm"
                >
                  Actualizar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}