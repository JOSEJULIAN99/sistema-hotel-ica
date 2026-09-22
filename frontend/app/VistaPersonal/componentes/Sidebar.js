import Link from 'next/link';
import Image from 'next/image';

export default function Sidebar({ activo}) {
 const getLinkClass = (nombreRuta) => {

    const isActive = activo === nombreRuta;
    return `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
      isActive
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'

        : 'hover:bg-slate-800 text-slate-300'

    }`;

  };

  return (

 <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between border-r border-slate-800">
  <div>
  <div className="p-6 border-b border-slate-700/60">
     <Image
     src="/hotel12.png" alt="Logo The Royal Hotel" width={140} height={45}className="object-contain mb-1.5" />

   </div>

      {/* Navbar*/}
  <nav className="p-4 space-y-1 text-xs font-medium">
    <Link href="/VistaPersonal/dashboard" className={getLinkClass('dashboard')}> 📊 Dashboard</Link>

    <Link href="/VistaPersonal/reservas" className={getLinkClass('reservas')}> 📅 Reservas</Link> 

    <Link href="/VistaPersonal/recepcion" className={getLinkClass('recepcion')}> 🔑 Check-in / Check-out  </Link>
      
    <Link href="/VistaPersonal/habitaciones" className={getLinkClass('habitaciones')}>🛏️ Habitaciones </Link>
      
    <Link href="/VistaPersonal/limpieza" className={getLinkClass('limpieza')}>🧹 Limpieza</Link>

    <Link href="/VistaPersonal/mantenimiento" className={getLinkClass('mantenimiento')}> 🔧 Mantenimiento </Link>

    <Link href="/VistaPersonal/consumo" className={getLinkClass('consumo')}> 💳 Consumos</Link>

    <Link href="/VistaPersonal/pagos" className={getLinkClass('pagos')}> 📄 Pagos y facturación</Link>  

    <Link href="/VistaPersonal/usuarios" className={getLinkClass('usuarios')}>👥 Usuarios y roles</Link>

  </nav>

  </div>

      {/*Cerrar Sesión */}

   <div className="p-4 border-t border-slate-700/60">

     <Link
          href="/" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-medium w-full" >
 <span>❌​</span>
  <span>Cerrar sesión</span>

     </Link>

      </div>

    </aside>

  );

} 

