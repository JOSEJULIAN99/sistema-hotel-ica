'use client';

import { ToastProvider } from '../components/Toast';
import EncabezadoPublico from '../components/publico/EncabezadoPublico';

// Portal del cliente: ingreso, registro y "Mis reservas"
export default function CuentaLayout({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-100">
        <EncabezadoPublico />
        <main className="flex-1">{children}</main>
      </div>
    </ToastProvider>
  );
}
