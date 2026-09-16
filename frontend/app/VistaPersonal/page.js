import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-6 py-12">
      
      {/* Contenedor Principal */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gray-200/60">
        
        {/*  Branding / Bienvenida */}
        <div className="bg-gradient-to-br from-blue-50/50 to-white p-12 flex flex-col justify-between border-r border-gray-100">
          <div>
            
            <div className="flex items-center gap-3 mb-8">
                <Image src="/hotel12.png" alt="Logo Royal" width={140} height={50} className="rounded-xl" />
              
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prices</h1>
                <p className="text-xs font-semibold text-blue-600 tracking-wider uppercase">Sistema de Gestión</p>
              </div>
            </div>
          </div>
          
          <div className="my-auto py-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">
              Una mejor <span className="text-blue-600">organización</span> para tu hotel
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Plataforma centralizada y moderna para la optimización de reservas, control inteligente de habitaciones y operaciones del personal en Ica.
            </p>
          </div>

          <div className="text-xs font-medium text-slate-400 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span>Empresa Royal</span>
            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">Ica -Perú</span>
          </div>
        </div>

        {/* Formulario de Inicio de Sesión */}
        <div className="p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-extrabold text-slate-900">Iniciar sesión</h3>
            <p className="text-sm text-slate-500 mt-1.5">Ingresa tus credenciales para acceder al sistema </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Usuario o correo
              </label>
              <input 
                type="text" 
                placeholder="ej. Juan Mendoza" 
                className="w-full px-4.5 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-800 bg-gray-50/50 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contraseña
                </label>
                <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4.5 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-800 bg-gray-50/50 transition"
              />
            </div>

            <Link 
              href="/VistaPersonal/dashboard"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition duration-200 text-sm text-center block">
              Acceder al Sistema
            </Link>
            
           
          </form>
        </div>

      </div>
    </div>
  );
}