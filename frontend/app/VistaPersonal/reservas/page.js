'use client';
import { useState } from 'react';
import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';


export default function ReservasPage() {
const [reservas, setReservas] = useState([
    { codigo: 'RES-101', huesped: 'Carlos Mendoza', habitacion: '102 (Matrimonial)', entrada: '15/09/2025', salida: '18/09/2025', estado: 'Confirmada' },
    { codigo: 'RES-102', huesped: 'María López', habitacion: '204 (Doble)', entrada: '16/09/2025', salida: '20/09/2025', estado: 'Confirmada' },
    { codigo: 'RES-103', huesped: 'Juan Pérez', habitacion: '308 (Simple)', entrada: '16/09/2025', salida: '17/09/2025', estado: 'Pendiente' },
  ]);

  const [busqueda, setBusqueda] = useState('');

  
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  
  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
  const [nuevaReserva, setNuevaReserva] = useState({
    codigo: `RES-10${reservas.length + 1}`,
    huesped: '',
    habitacion: '',
    entrada: '',
    salida: '',
    estado: 'Confirmada'
  });

  // Abrir modal editar
  const abrirModalEditar = (reserva) => {
    setReservaSeleccionada({ ...reserva });
    setModalEditarAbierto(true);
  };
  
  const guardarCambios = (e) => {
    e.preventDefault();
    setReservas(reservas.map(r => r.codigo === reservaSeleccionada.codigo ? reservaSeleccionada : r));
    setModalEditarAbierto(false);
  };

  
  const agregarReserva = (e) => {
    e.preventDefault();
    setReservas([nuevaReserva, ...reservas]); 
    setModalNuevaAbierto(false);
    // Reiniciar formulario con un nuevo código automático
    setNuevaReserva({
      codigo: `RES-10${reservas.length + 2}`,
      huesped: '',
      habitacion: '',
      entrada: '',
      salida: '',
      estado: 'Confirmada'
    });
  };
  
  const reservasFiltradas = reservas.filter(r => 
    r.huesped.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      <Sidebar activo="reservas" />

      <main className="flex-1 flex flex-col overflow-y-auto">
        
        <Header 
          titulo="Gestión de Reservas" 
          subtitulo="Administra las reservas actuales, nuevas o pendientes"  />

        <div className="p-8 space-y-6 w-full">
          
          {/* Barra de Acciones y Buscador */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por código o nombre de huésped..." 
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs w-80 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"  />
            
            <button 
              onClick={() => setModalNuevaAbierto(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer shadow-sm">
              + Nueva Reserva
            </button>
          </div>

          {/* Tabla de Reservas */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
                  <th className="p-4 font-semibold">Código</th>
                  <th className="p-4 font-semibold">Huésped</th>
                  <th className="p-4 font-semibold">Habitación</th>
                  <th className="p-4 font-semibold">Entrada</th>
                  <th className="p-4 font-semibold">Salida</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {reservasFiltradas.length > 0 ? (
                  reservasFiltradas.map((res, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold text-blue-600">{res.codigo}</td>
                      <td className="p-4 font-medium text-slate-800">{res.huesped}</td>
                      <td className="p-4">{res.habitacion}</td>
                      <td className="p-4">{res.entrada}</td>
                      <td className="p-4">{res.salida}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-medium text-[10px] ${
                          res.estado === 'Confirmada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {res.estado}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => abrirModalEditar(res)}
                          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer "
                        >
                          Ver / Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-400">
                      No se encontraron reservas con &quot;{busqueda}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* Modal para crear una nueva reserva */}
      {modalNuevaAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-slate-800">Crear Nueva Reserva</h3>
              <button 
                onClick={() => setModalNuevaAbierto(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={agregarReserva} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Código de Reserva</label>
                <input 
                  type="text" 
                  value={nuevaReserva.codigo}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-slate-400 bg-gray-100 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Nombre del Huésped</label>
                <input 
                  type="text" 
                  placeholder="Ej. Ana Torres"
                  value={nuevaReserva.huesped}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, huesped: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required  />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Habitación</label>
                <input 
                  type="text" 
                  placeholder="Ej. 105 (Doble)"
                  value={nuevaReserva.habitacion}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, habitacion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Entrada</label>
                  <input 
                    type="text" 
                    placeholder="DD/MM/AAAA"
                    value={nuevaReserva.entrada}
                    onChange={(e) => setNuevaReserva({...nuevaReserva, entrada: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Salida</label>
                  <input 
                    type="text" 
                    placeholder="DD/MM/AAAA"
                    value={nuevaReserva.salida}
                    onChange={(e) => setNuevaReserva({...nuevaReserva, salida: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Estado</label>
                <select 
                  value={nuevaReserva.estado}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Confirmada">Confirmada</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setModalNuevaAbierto(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer shadow-sm"
                >
                  Registrar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar */}
      {modalEditarAbierto && reservaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-slate-800">Editar Reserva: {reservaSeleccionada.codigo}</h3>
              <button 
                onClick={() => setModalEditarAbierto(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardarCambios} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Nombre del Huésped</label>
                <input 
                  type="text" 
                  value={reservaSeleccionada.huesped}
                  onChange={(e) => setReservaSeleccionada({...reservaSeleccionada, huesped: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Habitación</label>
                <input 
                  type="text" 
                  value={reservaSeleccionada.habitacion}
                  onChange={(e) => setReservaSeleccionada({...reservaSeleccionada, habitacion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Entrada</label>
                  <input 
                    type="text" 
                    value={reservaSeleccionada.entrada}
                    onChange={(e) => setReservaSeleccionada({...reservaSeleccionada, entrada: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Salida</label>
                  <input 
                    type="text" 
                    value={reservaSeleccionada.salida}
                    onChange={(e) => setReservaSeleccionada({...reservaSeleccionada, salida: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Estado</label>
                <select 
                  value={reservaSeleccionada.estado}
                  onChange={(e) => setReservaSeleccionada({...reservaSeleccionada, estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Confirmada">Confirmada</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setModalEditarAbierto(false)}
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