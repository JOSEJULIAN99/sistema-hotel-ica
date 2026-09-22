import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function ConsumosPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* Sidebar reutilizado */}
      <Sidebar activo="consumos" />

      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header reutilizado */}
        <Header 
          titulo="Control de Consumos y Servicios" 
          subtitulo="Registro de consumos adicionales del huésped (Minibar, Restaurante, Lavandería)" 
        />

        <div className="p-10 space-y-6">
          
          {/* Métricas rápidas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Consumos del Día</p>
              <p className="text-xl font-bold text-blue-600 mt-1">S/ 480.00</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Categoría Más Solicitada</p>
              <p className="text-xl font-bold text-slate-700 mt-1">Restaurante / Bar</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Pendientes de Facturar</p>
              <p className="text-xl font-bold text-amber-600 mt-1">8</p>
            </div>
          </div>

          {/* Tabla de Registro de consumos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Historial de Consumos por Habitación</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                + Registrar Consumo
              </button>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Habitación</th>
                  <th className="p-4 font-semibold">Huésped</th>
                  <th className="p-4 font-semibold">Descripción del Servicio</th>
                  <th className="p-4 font-semibold">Categoría</th>
                  <th className="p-4 font-semibold">Monto</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">102</td>
                  <td className="p-4 font-medium">Carlos Mendoza</td>
                  <td className="p-4">Cena ejecutiva (2 personas)</td>
                  <td className="p-4">
                    <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Restaurante</span>
                  </td>
                  <td className="p-4 font-bold text-slate-900">S/ 95.00</td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Ver detalle</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">204</td>
                  <td className="p-4 font-medium">María López</td>
                  <td className="p-4">Servicio de Lavandería (Express)</td>
                  <td className="p-4">
                    <span className="bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Lavandería</span>
                  </td>
                  <td className="p-4 font-bold text-slate-900">S/ 45.00</td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Ver detalle</button>
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