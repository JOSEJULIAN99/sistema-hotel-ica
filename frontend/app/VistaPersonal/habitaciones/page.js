import Link from 'next/link';
import Image from 'next/image';

export default function HabitacionesPage() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* 1. Sidebar (Menú Lateral Institucional) */}
      <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo y Subtítulo */}
          <div className="p-6 border-b border-slate-700/60">
            <Image 
              src="/hotel2.jpg" 
              alt="Logo The Royal Hotel" 
              width={140} 
              height={45} 
              className="object-contain mb-1.5" 
            />
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold pl-1">
              Sistema de Gestión
            </p>
          </div>

          {/* Opciones de Navegación */}
          <nav className="p-4 space-y-1 text-xs font-medium">
            <Link href="/app/VistaPersonal/dashboard" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              📊 Dashboard
            </Link>
            <Link href="/app/VistaPersonal/reservas" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              📅 Reservas
            </Link>
            <Link href="/VistaPersonal/habitaciones" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🔑 Check-in / Check-out
            </Link>
            <Link href="/VistaPersonal/habitaciones" className="flex items-center gap-3 px-4 py-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg">
              🛏️ Habitaciones
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🧹 Limpieza
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              🔧 Mantenimiento
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              💳 Consumos
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              📄 Pagos y facturación
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
              👥 Usuarios y roles
            </Link>
          </nav>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="p-4 border-t border-slate-700/60">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-medium w-full"
          >
            <span>❌​</span>
            <span>Cerrar sesión</span>
          </Link>
        </div>
      </aside>

      {/* 2. Área Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Control de Habitaciones</h2>
            <p className="text-xs text-gray-500">Estado general y disponibilidad de la infraestructura hotelera</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
              📅 Hoy, 16 de septiembre de 2025
            </span>
            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
              <div className="bg-blue-600 text-white font-bold w-9 h-9 rounded-full flex items-center justify-center">
                AT
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Ana Torres</p>
                <p className="text-[11px] text-gray-500">Recepción</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la Página */}
        <div className="p-10 space-y-6">
          
          {/* Filtros rápidos por estado */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Disponibles</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">12</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Ocupadas</p>
              <p className="text-xl font-bold text-blue-600 mt-1">16</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">En Limpieza</p>
              <p className="text-xl font-bold text-amber-600 mt-1">2</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Mantenimiento</p>
              <p className="text-xl font-bold text-rose-600 mt-1">0</p>
            </div>
          </div>

          {/* Listado / Tabla de Habitaciones */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Listado de Habitaciones</h3>
              <input 
                type="text" 
                placeholder="Buscar habitación..." 
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs w-64 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Número</th>
                  <th className="p-4 font-semibold">Tipo</th>
                  <th className="p-4 font-semibold">Precio / Noche</th>
                  <th className="p-4 font-semibold">Estado Actual</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">102</td>
                  <td className="p-4">Matrimonial</td>
                  <td className="p-4">S/ 180.00</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Ocupada</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-500 hover:text-blue-600 font-medium">Ver detalle</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">204</td>
                  <td className="p-4">Doble</td>
                  <td className="p-4">S/ 240.00</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium text-[11px]">Disponible</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-500 hover:text-blue-600 font-medium">Ver detalle</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">308</td>
                  <td className="p-4">Simple</td>
                  <td className="p-4">S/ 120.00</td>
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium text-[11px]">En Limpieza</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-500 hover:text-blue-600 font-medium">Ver detalle</button>
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