import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function FacturacionPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
     
      <Sidebar activo="facturacion" />

      
      <main className="flex-1 flex flex-col overflow-y-auto">
        
       
        <Header 
          titulo="Pagos y Facturación" 
          subtitulo="Gestión de cobros, emisión de comprobantes y cierre de cuentas de huéspedes"  />

        <div className="p-10 space-y-6">
          
          {/* Métricas rápidas financieras */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Ingresos Facturados (Hoy)</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">S/ 3,450.00</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Cuentas por Cobrar (Check-outs)</p>
              <p className="text-xl font-bold text-amber-600 mt-1">S/ 840.00</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Comprobantes Emitidos</p>
              <p className="text-xl font-bold text-blue-600 mt-1">12</p>
            </div>
          </div>

          {/* Tabla de historial de cuentas */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Cuentas de Huéspedes y Estado de Pagos</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar por DNI/RUC o huésped..." 
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs w-64 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Comprobante</th>
                  <th className="p-4 font-semibold">Huésped / Razón Social</th>
                  <th className="p-4 font-semibold">Hab.</th>
                  <th className="p-4 font-semibold">Monto Total</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold">Método de Pago</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-medium text-slate-500">Por emitir</td>
                  <td className="p-4 font-bold text-slate-800">Carlos Mendoza</td>
                  <td className="p-4">102</td>
                  <td className="p-4 font-bold text-slate-900">S/ 635.00</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Pendiente</span>
                  </td>
                  <td className="p-4 text-slate-500">No registrado</td>
                  <td className="p-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition text-[11px]">
                      Cobrar y Emitir
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-medium text-slate-800">F001-000452</td>
                  <td className="p-4 font-bold text-slate-800">Empresa Tech Solutions SAC</td>
                  <td className="p-4">204</td>
                  <td className="p-4 font-bold text-slate-900">S/ 1,240.00</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Pagado</span>
                  </td>
                  <td className="p-4">Tarjeta de Crédito</td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium text-[11px]">Ver PDF</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-medium text-slate-800">B001-000891</td>
                  <td className="p-4 font-bold text-slate-800">María López</td>
                  <td className="p-4">305</td>
                  <td className="p-4 font-bold text-slate-900">S/ 320.00</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Pagado</span>
                  </td>
                  <td className="p-4">Efectivo</td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium text-[11px]">Ver PDF</button>
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