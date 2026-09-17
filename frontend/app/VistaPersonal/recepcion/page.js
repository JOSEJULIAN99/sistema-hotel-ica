import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function RecepcionPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* 1. Sidebar Reutilizable (Indicando que estamos en 'recepcion') */}
      <Sidebar activo="recepcion" />

      {/* 2. Área Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Reutilizable */}
        <Header 
          titulo="Control de Check-in y Check-out" 
          subtitulo="Gestión de ingresos y salidas de huéspedes en tiempo real" 
        />

        {/* Contenido de la Página */}
        <div className="p-10 space-y-6">
          
          {/* Pestañas o Métricas Operativas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Llegadas Previstas (Hoy)</p>
              <p className="text-xl font-bold text-blue-600 mt-1">5</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Huéspedes Hospedados</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">16</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Salidas Previstas (Hoy)</p>
              <p className="text-xl font-bold text-amber-600 mt-1">3</p>
            </div>
          </div>

          {/* Tabla de Operaciones de Recepción */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Huéspedes en Curso y Próximos Movimientos</h3>
              <input 
                type="text" 
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
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">Juan Pérez</td>
                  <td className="p-4">204 (Doble)</td>
                  <td className="p-4 font-medium text-blue-600">Check-in</td>
                  <td className="p-4">12:30 PM</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Pendiente de llegada</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition">
                      Realizar Check-in
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">Carlos Mendoza</td>
                  <td className="p-4">102 (Matrimonial)</td>
                  <td className="p-4 font-medium text-amber-600">Check-out</td>
                  <td className="p-4">11:00 AM</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">En estancia</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg font-semibold transition">
                      Realizar Check-out
                    </button>
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