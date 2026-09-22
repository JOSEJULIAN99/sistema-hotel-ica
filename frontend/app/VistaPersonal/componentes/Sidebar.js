import Link from 'next/link';
import Image from 'next/image';

export default function Sidebar({ activo, rol = 'admin'}) {
  return (
    <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between border-r border-slate-800">
      <div>
        {/* Logo y Subtítulo */}
        <div className="p-6 border-b border-slate-700/60">
          <Image 
            src="/hotel12.png" 
            alt="Logo The Royal Hotel" 
            width={140} 
            height={45} 
            className="object-contain mb-1.5" 
          />
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold pl-1">
            Sistema de Gestión ({rol === 'admin' ? 'Administrador' : 'Recepción'})
          </p>
        </div>

        {/* Opciones de Navegación */}
        <nav className="p-4 space-y-1 text-xs font-medium">
          <Link 
            href="/VistaPersonal/dashboard" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activo === 'dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            href="/VistaPersonal/reservas" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activo === 'reservas' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'}`}
          >
            📅 Reservas
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 rounded-lg transition">
            🔑 Check-in / Check-out
          </Link>
          <Link 
            href="/VistaPersonal/habitaciones" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activo === 'habitaciones' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'}`}
          >
            🛏️ Habitaciones
          </Link>
          <Link 
            href="/VistaPersonal/limpieza" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activo === 'limpieza' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'}`}
          >
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
  );
}