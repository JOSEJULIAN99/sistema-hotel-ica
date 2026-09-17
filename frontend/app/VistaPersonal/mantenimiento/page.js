import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function MantenimientoPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* 1. Sidebar Reutilizable (Indicando que estamos en 'mantenimiento') */}
      <Sidebar activo="mantenimiento" />

      {/* 2. Área Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Reutilizable */}
        <Header 
          titulo="Control de Mantenimiento" 
          subtitulo="Registro y seguimiento de incidencias técnicas en la infraestructura" 
        />

        {/* Contenido de la Página */}
        <div className="p-10 space-y-6">
          
          {/* Métricas rápidas de incidencias */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Reportes Pendientes</p>
              <p className="text-xl font-bold text-rose-600 mt-1">1</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">En Reparación</p>
              <p className="text-xl font-bold text-amber-600 mt-1">1</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Resueltos (Este Mes)</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">14</p>
            </div>
          </div>

          {/* Tabla de Incidencias / Mantenimiento */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Incidencias y Reparaciones Activas</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                + Reportar Incidencia
              </button>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Código</th>
                  <th className="p-4 font-semibold">Habitación</th>
                  <th className="p-4 font-semibold">Descripción del Problema</th>
                  <th className="p-4 font-semibold">Prioridad</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">INC-001</td>
                  <td className="p-4 font-semibold">302</td>
                  <td className="p-4">Fuga de agua en el baño principal</td>
                  <td className="p-4">
                    <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Alta</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium text-[11px]">En Reparación</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Finalizar</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">INC-002</td>
                  <td className="p-4 font-semibold">104</td>
                  <td className="p-4">Falla en el control remoto del aire acondicionado</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Media</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Pendiente</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Iniciar</button>
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