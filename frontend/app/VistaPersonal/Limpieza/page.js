import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function LimpiezaPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/*Sidebar reutilizado */}
      <Sidebar activo="limpieza" />

     
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header reutilizado*/}
        <Header 
          titulo="Control de Limpieza y Pisos" 
          subtitulo="Monitoreo de estado de higienización de habitaciones" 
        />

        <div className="p-10 space-y-6">
          
          {/* Métricas rápidas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Habitaciones Limpias</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">28</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">En Proceso de Limpieza</p>
              <p className="text-xl font-bold text-amber-600 mt-1">2</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Pendientes de Revisión</p>
              <p className="text-xl font-bold text-slate-600 mt-1">0</p>
            </div>
          </div>

          {/* Tabla de Control de Limpieza */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Estado de Pisos y Limpieza</h3>
              <input 
                type="text" 
                placeholder="Filtrar por habitación..." 
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs w-64 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Habitación</th>
                  <th className="p-4 font-semibold">Piso</th>
                  <th className="p-4 font-semibold">Personal Asignado</th>
                  <th className="p-4 font-semibold">Estado de Limpieza</th>
                  <th className="p-4 font-semibold text-center">Acciones / Reporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">308</td>
                  <td className="p-4">Piso 3</td>
                  <td className="p-4">Rosa Gómez</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium text-[11px]">En Limpieza</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Actualizar estado</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">105</td>
                  <td className="p-4">Piso 1</td>
                  <td className="p-4">Juana Quispe</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">LIMPIO / Listo</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Actualizar estado</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">202</td>
                  <td className="p-4">Piso 2</td>
                  <td className="p-4">Rosa Gómez</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">LIMPIO / Listo</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Actualizar estado</button>
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