import Sidebar from '../componentes/Sidebar';
import Header from '../componentes/Header';

export default function UsuariosPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* 1. Sidebar Reutilizable (Indicando que estamos en 'usuarios') */}
      <Sidebar activo="reservas" rol="admin" />

      {/* 2. Área Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Reutilizable */}
        <Header 
          titulo="Gestión de Usuarios y Roles" 
          subtitulo="Administración de accesos, credenciales y permisos del personal del hotel" 
        />

        {/* Contenido de la Página */}
        <div className="p-10 space-y-6">
          
          {/* Métricas rápidas de usuarios */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Usuarios Activos</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">8</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Roles Configurados</p>
              <p className="text-xl font-bold text-blue-600 mt-1">4</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Intentos de Acceso Fallidos</p>
              <p className="text-xl font-bold text-slate-600 mt-1">0</p>
            </div>
          </div>

          {/* Tabla de Usuarios y Roles */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Listado de Personal y Accesos al Sistema</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                + Nuevo Usuario
              </button>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Colaborador</th>
                  <th className="p-4 font-semibold">Correo Electrónico</th>
                  <th className="p-4 font-semibold">Rol Asignado</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">Ana Torres</td>
                  <td className="p-4 text-slate-500">atorres@theroyalhotel.com</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Recepción</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Activo</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Editar Permisos</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">Carlos Gómez</td>
                  <td className="p-4 text-slate-500">cgomez@theroyalhotel.com</td>
                  <td className="p-4">
                    <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Administrador</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Activo</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Editar Permisos</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">Rosa Ruiz</td>
                  <td className="p-4 text-slate-500">rruiz@theroyalhotel.com</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Limpieza</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Activo</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline font-medium">Editar Permisos</button>
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