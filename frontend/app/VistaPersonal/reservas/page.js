import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function ReservasPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* 1. Sidebar Reutilizable (Indicando que estamos en 'reservas') */}
      <Sidebar activo="reservas" rol="recepcion" />

      {/* 2. Área Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Reutilizable */}
        <Header 
          titulo="Gestión de Reservas" 
          subtitulo="Control y registro general de reservas del hotel" 
        />

        {/* Contenido de la Página */}
        <div className="p-10 space-y-6">
          
          {/* Barra de Acciones (Buscador y Botón Nueva Reserva) */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
            <input 
              type="text" 
              placeholder="Buscar por código o nombre de huésped..." 
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs w-96 text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap">
              + Nueva Reserva
            </button>
          </div>

          {/* Tabla de Reservas */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider">
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
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-blue-600">RES-101</td>
                  <td className="p-4 font-medium text-slate-800">Carlos Mendoza</td>
                  <td className="p-4">102 (Matrimonial)</td>
                  <td className="p-4">15/09/2025</td>
                  <td className="p-4">18/09/2025</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Confirmada</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-500 hover:text-blue-600 font-medium">Ver / Editar</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-blue-600">RES-102</td>
                  <td className="p-4 font-medium text-slate-800">María López</td>
                  <td className="p-4">204 (Doble)</td>
                  <td className="p-4">16/09/2025</td>
                  <td className="p-4">20/09/2025</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Confirmada</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-500 hover:text-blue-600 font-medium">Ver / Editar</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-blue-600">RES-103</td>
                  <td className="p-4 font-medium text-slate-800">Juan Pérez</td>
                  <td className="p-4">308 (Simple)</td>
                  <td className="p-4">16/09/2025</td>
                  <td className="p-4">17/09/2025</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Pendiente</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-500 hover:text-blue-600 font-medium">Ver / Editar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}